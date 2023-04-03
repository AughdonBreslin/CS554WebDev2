const express = require('express');
const router = express.Router();
const validation = require('../validation');
const data = require('../data');
const {ObjectId} = require('mongodb');
const recipeData = data.recipes;

const flat = require('flat');
const unflatten = flat.unflatten;
const redis = require('redis');
const client = redis.createClient();
client.connect().then(() => {});

// GET /recipes
router.get('/', async (req, res) => {
  // do validation testing
  let page, recipeList;
  try {
    page = parseInt(req.query.page) || 1;
    validation.checkInt(page, 'page number', true);
  } catch (e) {
    return res.status(400).json({error: e});
  }

  // Check if page is cached in redis
  let exists = await client.exists(`recipeList${page}`);
  if (exists) {
    //if we do have it in cache, send the raw html from cache
    console.log(`Recipe list ${page} is in cache!`);
    let recipeList = await client.get(`recipeList${page}`);
    return res.status(200).send(JSON.parse(recipeList));
  } else {
    console.log(`Recipe list ${page} not in cache.`);
  }

  // Get it from database
  try {
    recipeList = await recipeData.getAllRecipes(page);
    let flatRecipeList = JSON.stringify(recipeList);
    let hSetAsyncRecipeList = await client.set(`recipeList${page}`, flatRecipeList, 'EX 180');
    return res.status(200).json(recipeList);
  } catch(e) {
    return res.status(404).json({error: e});
  }
});

// GET /recipes/:id
router.get('/:id', async (req, res) => {
  // Do validation testing
  let id = req.params.id;
  try {
    id = validation.checkId(id, 'Id URL Param');
  } catch (e) {
    return res.status(400).json({error: e});
  }

  // Check if recipe is cached in redis
  let exists = await client.exists(`recipe${id}`);
  let recipe, flatRecipe;

  if (exists) {
    // Recipe is in cache, grab and parse it.
    console.log(`Recipe ${id} is in cache!`);
    flatRecipe = await client.get(`recipe${id}`);
    recipe = JSON.parse(flatRecipe);
  } else {
    console.log(`Recipe ${id} not in cache.`);
    // Recipe is not in cache, so pull from database
    try {
      recipe = await recipeData.getRecipeById(id);
      flatRecipe = JSON.stringify(recipe);
      let setAsyncRecipe = await client.set(`recipe${id}`, flatRecipe, 'EX 6000');
    } catch (e) {
      return res.status(404).json({error: e});
    }
  }

  // Update recipesVisited
  let existsInRecipesVisited = await client.zRank('recipesVisited', flatRecipe);
  // if flatRecipe object is already in, increment its visited counter
  if (existsInRecipesVisited !== null) {
    let incrementing = await client.zIncrBy('recipesVisited', 1, flatRecipe);
  } else {
    console.warn(`Recipe with ID ${id} should have been added to recipesVisited when posted.`);
    // if it has not, add it and set its value to 1
    let adding = await client.zAdd('recipesVisited', {score: 1, value: flatRecipe});
  }
  return res.status(200).json({recipe: recipe});
});

// POST /recipes
router.post('/', async (req, res) => {
  // Do (a lot of) validation testing
  const user = {_id: new ObjectId(req.session._id), username: req.session.username};
  let title;
  let ingredients;
  let cookingSkillRequired;
  let steps;
  try {
    title = req.body.title;
    ingredients = req.body.ingredients;
    cookingSkillRequired = req.body.cookingSkillRequired;
    steps = req.body.steps;
    validation.checkIsProper(title, 'string', 'title');
    title = title.trim();
    validation.checkString(title, 1, 40, 'title', true, false, true);    

    // For ingredients, each element must be a valid string, at least 3 elements, each element should be within [3,50] characters
    validation.checkStringArray(ingredients,'string', 'ingredients', 3, Infinity, 3, 50, true, false, true, true);
    ingredients = validation.trimArray(ingredients);
    
    // For steps, each element must be a valid string, at least 5 elements, and each element should be at least 20 characters
    validation.checkStringArray(steps, 'string', 'steps', 5, Infinity, 20, Infinity, true, false, true, true);
    steps = validation.trimArray(steps);
    
    validation.checkIsProper(cookingSkillRequired, 'string', 'cookingSkillRequired');
    cookingSkillRequired = cookingSkillRequired.trim().toLowerCase();
    if(cookingSkillRequired != 'novice' && cookingSkillRequired != 'intermediate' && cookingSkillRequired != 'advanced')
        throw `Error: cookingSkillRequired '${cookingSkillRequired}' is invalid. Must be either 'Novice', 'Intermediate', or 'Advanced'.`;
  } catch(e) {
    return res.status(400).json({error: e});
  }

  // Add recipe to database and cache in redis
  let newRecipe, flatRecipe, id;
  try {
    newRecipe = await recipeData.createRecipe(title, ingredients, cookingSkillRequired, steps, user);
    flatRecipe = JSON.stringify(newRecipe);
    id = newRecipe._id;
    let setAsyncRecipe = await client.set(`recipe${id}`, flatRecipe, 'EX 6000');
  } catch(e) {
    return res.status(500).json({error: e});
  }

  // Update recipesVisited
  let existsInRecipesVisited = await client.zRank('recipesVisited', flatRecipe);
  // if flatRecipe object is already in, increment its visited counter
  if (existsInRecipesVisited !== null) {
    console.warn(`New recipe with ID ${id} should not have already been added to recipesVisited.`);
    let incrementing = await client.zIncrBy('recipesVisited', 1, flatRecipe);
  } else {
    // if it has not, add it and set its value to 1
    let adding = await client.zAdd('recipesVisited', {score: 1, value: flatRecipe});
  }
  return res.status(200).json({recipe: newRecipe});
});

// PATCH /recipes/:id
router.patch('/:id', async (req, res) => {
  // Do (a lot of) validation testing
  const requestBody = req.body;
  let id = req.params.id;
  try {
    id = validation.checkId(id, 'Post ID');
    if(requestBody.title) {
      validation.checkIsProper(requestBody.title, 'string', 'title');
      requestBody.title = requestBody.title.trim();
      validation.checkString(requestBody.title, 1, 40, 'title', true, false, true);
    }
    if(requestBody.ingredients){
      validation.checkStringArray(requestBody.ingredients,'string', 'ingredients', 3, Infinity, 3, 50, true, false, true, true);
      requestBody.ingredients = validation.trimArray(requestBody.ingredients);
    }
    if(requestBody.steps){
      validation.checkStringArray(requestBody.steps, 'string', 'steps', 5, Infinity, 20, Infinity, true, false, true, true);
      requestBody.steps = validation.trimArray(requestBody.steps);
    }
    if(requestBody.cookingSkillRequired){
      validation.checkIsProper(requestBody.cookingSkillRequired, 'string', 'cookingSkillRequired');
      requestBody.cookingSkillRequired = requestBody.cookingSkillRequired.trim().toLowerCase();
      if(requestBody.cookingSkillRequired != 'novice' && requestBody.cookingSkillRequired != 'intermediate' && requestBody.cookingSkillRequired != 'advanced')
        throw `Error: cookingSkillRequired '${requestBody.cookingSkillRequired}' is invalid. Must be either 'Novice', 'Intermediate', or 'Advanced'.`
    }
  } catch (e) {
    return res.status(400).json({error: e});
  }

  // Update the recipe object contents
  let oldRecipe, updateFields = {};
  try {
    oldRecipe = await recipeData.getRecipeById(id);
    if(requestBody.title && requestBody.title != oldRecipe.title)
      updateFields.title = requestBody.title;
    if(requestBody.ingredients && !validation.checkArraysEqual(requestBody.ingredients, oldRecipe.ingredients))
      updateFields.ingredients = requestBody.ingredients;
    if(requestBody.steps && !validation.checkArraysEqual(requestBody.steps, oldRecipe.steps))
      updateFields.steps = requestBody.steps;
    if(requestBody.cookingSkillRequired && requestBody.cookingSkillRequired != oldRecipe.cookingSkillRequired)
      updateFields.cookingSkillRequired = requestBody.cookingSkillRequired;
  } catch (e) {
    return res.status(404).json({error: e});
  }

  // Update the recipe in the database
  let updatedRecipe;
  if(Object.keys(updateFields).length !== 0) {
    try {
      updatedRecipe = await recipeData.updateRecipe(req.params.id, updateFields, req.session._id);
    } catch (e) {
      return res.status(400).json({error: e});
    }
  } else {
    return res.status(400).json({error: 'No fields have been changed. Nothing to update.'});
  }

  // Update the recipe in redis
  let flatOldRecipe = JSON.stringify(oldRecipe),
      flatNewRecipe = JSON.stringify(updatedRecipe);

  // Regardless of whether the recipe was previously in the cache,
  //  we are putting the updated version in redis now.
  let setAsyncRecipe = await client.set(`recipe${id}`, flatNewRecipe, 'EX 6000');

  // Update the recipesVisited in redis
  let existsInRecipesVisited = await client.zRank('recipesVisited', flatOldRecipe);
  
  // if the old recipe was in the recipesVisited list, we need to update it.
  if (existsInRecipesVisited !== null) {
    let score = await client.zScore('recipesVisited', flatOldRecipe);
    let deletedOldRecipe = await client.zRem('recipesVisited', flatOldRecipe);
    let numberOfNewAdditions = await client.zAdd('recipesVisited', {score: score, value: flatNewRecipe});
    if(numberOfNewAdditions != 1) {
      console.warn("Recipe failed to update.");
    }
  } // else if the old recipe was not in the recipesVisited list, there's no need to add it now.

  return res.status(200).json(updatedRecipe);
});

// POST /recipes/:id/comments
router.post('/:id/comments', async (req, res) => {
  // Do validation testing
  let comment = req.body.comment || "";
  let id = req.params.id;
  const user = {_id: new ObjectId(req.session._id), username: req.session.username};
  try {
    id = validation.checkId(id, 'Id URL Param');
    validation.checkIsProper(comment, 'string', 'comment');
    comment = comment.trim();
    validation.checkString(comment, 1, 100, 'comment', true, true, true, true);
  } catch (e) {
    return res.status(400).json({error: e});
  }

  // Get old recipe (for redis purposes)
  let oldRecipe;
  try {
    oldRecipe = await recipeData.getRecipeById(id);
  } catch (e) {
    return res.status(404).json({error: e});
  }

  // Create comment
  let updatedRecipe;
  try {
    updatedRecipe = await recipeData.createComment(comment, id, user);
  } catch (e) {
    return res.status(401).json({error: e});
  }

  // Update the recipe in redis
  let flatOldRecipe = JSON.stringify(oldRecipe),
      flatNewRecipe = JSON.stringify(updatedRecipe);

  // Regardless of whether the recipe was previously in the cache,
  //  we are putting the updated version in redis now.
  let setAsyncRecipe = await client.set(`recipe${id}`, flatNewRecipe, 'EX 6000');

  // Update the recipesVisited in redis
  let existsInRecipesVisited = await client.zRank('recipesVisited', flatOldRecipe);
  
  // if the old recipe was in the recipesVisited list, we need to update it.
  if (existsInRecipesVisited !== null) {
    let score = await client.zScore('recipesVisited', flatOldRecipe);
    let deletedOldRecipe = await client.zRem('recipesVisited', flatOldRecipe);
    let numberOfNewAdditions = await client.zAdd('recipesVisited', {score: score, value: flatNewRecipe});
    if(numberOfNewAdditions != 1) {
      console.warn("Recipe failed to update.");
    }
  } // else if the old recipe was not in the recipesVisited list, there's no need to add it now.

  return res.status(200).json(updatedRecipe);
});

// DELETE /recipes/:recipeId/:commmentId
router.delete('/:recipeId/:commentId', async (req, res) => {
  let recipeId = req.params.recipeId,
      commentId = req.params.commentId;
  try {
    recipeId = validation.checkId(recipeId, 'Recipe ID');
    commentId = validation.checkId(commentId, 'Comment ID');
  } catch (e) {
    return res.status(400).json({error: e});
  }
  let oldRecipe,
      updatedRecipe;
  try {
    oldRecipe = await recipeData.getRecipeById(recipeId);
    let commentExistsFlag = false;
    for (const comment of oldRecipe.comments) {
      if(comment._id == commentId) {
        commentExistsFlag = true;
      }
    }
    if (!commentExistsFlag) {
      throw `Error: Could not find comment with id ${commentId} in recipe with id ${recipeId}.`;
    }
  } catch (e) {
    return res.status(404).json({error: e});
  }
  try {
    updatedRecipe = await recipeData.removeRecipeComment(recipeId, commentId, req.session._id);
  } catch (e) {
    return res.status(401).json({error: e});
  }

  // Update the recipe in redis
  let flatOldRecipe = JSON.stringify(oldRecipe),
      flatNewRecipe = JSON.stringify(updatedRecipe);

  // Regardless of whether the recipe was previously in the cache,
  //  we are putting the updated version in redis now.
  let setAsyncRecipe = await client.set(`recipe${recipeId}`, flatNewRecipe, 'EX 6000');

  // Update the recipesVisited in redis
  let existsInRecipesVisited = await client.zRank('recipesVisited', flatOldRecipe);

  // if the old recipe was in the recipesVisited list, we need to update it.
  if (existsInRecipesVisited !== null) {
    let score = await client.zScore('recipesVisited', flatOldRecipe);
    let deletedOldRecipe = await client.zRem('recipesVisited', flatOldRecipe);
    let numberOfNewAdditions = await client.zAdd('recipesVisited', {score: score, value: flatNewRecipe});
    if(numberOfNewAdditions != 1) {
      console.warn("Recipe failed to update.");
    }
  } // else if the old recipe was not in the recipesVisited list, there's no need to add it now.

  return res.status(200).json(updatedRecipe);
});

// POST /recipes/:id/likes
router.post('/:id/likes', async (req, res) => {
  let userId = req.session._id,
      recipeId = req.params.id;

  // Check input
  try {
    userId = validation.checkId(userId, 'userId');
    recipeId = validation.checkId(recipeId, 'recipeId');
  } catch (e) {
    return res.status(400).json({error: e});
  }

  // Find recipe
  let oldRecipe, 
      updatedRecipe;
  try {
    oldRecipe = await recipeData.getRecipeById(recipeId);
  } catch (e) {
    return res.status(404).json({error: e});
  }

  // if alreadyLiked, we should remove like, else add like
  let alreadyLiked = false;
  for (const like of oldRecipe.likes) {
    if(like == userId) {
      alreadyLiked = true;
    }
  }

  // Add/remove like
  try {
    updatedRecipe = await recipeData.toggleLike(recipeId, userId, alreadyLiked);
  } catch (e) {
    return res.status(500).json({error: e});
  }

  // Update the recipe in redis
  let flatOldRecipe = JSON.stringify(oldRecipe),
      flatNewRecipe = JSON.stringify(updatedRecipe);

  // Regardless of whether the recipe was previously in the cache,
  //  we are putting the updated version in redis now.
  let setAsyncRecipe = await client.set(`recipe${recipeId}`, flatNewRecipe, 'EX 6000');

  // Update the recipesVisited in redis
  let existsInRecipesVisited = await client.zRank('recipesVisited', flatOldRecipe);

  // if the old recipe was in the recipesVisited list, we need to update it.
  if (existsInRecipesVisited !== null) {
    let score = await client.zScore('recipesVisited', flatOldRecipe);
    let deletedOldRecipe = await client.zRem('recipesVisited', flatOldRecipe);
    let numberOfNewAdditions = await client.zAdd('recipesVisited', {score: score, value: flatNewRecipe});
    if(numberOfNewAdditions != 1) {
      console.warn("Recipe failed to update.");
    }
  } // else if the old recipe was not in the recipesVisited list, there's no need to add it now.

  return res.status(200).json(updatedRecipe);
});

module.exports = router;