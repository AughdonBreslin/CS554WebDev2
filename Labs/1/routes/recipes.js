const express = require('express');
const router = express.Router();
const validation = require('../validation');
const data = require('../data');
const {ObjectId} = require('mongodb');
const recipeData = data.recipes;

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
  try {
    recipeList = await recipeData.getAllRecipes(page);
  } catch(e) {
    return res.status(404).json({error: e});
  }
  return res.status(200).json(recipeList);
});

// GET /recipes/:id
router.get('/:id', async (req, res) => {
  try {
    req.params.id = validation.checkId(req.params.id, 'Id URL Param');
  } catch (e) {
    return res.status(400).json({error: e});
  }
  try {
    const recipe = await recipeData.getRecipeById(req.params.id);
    return res.status(200).json(recipe);
  } catch (e) {
    return res.status(404).json({error: e});
  }
});

// POST /recipes
router.post('/', async (req, res) => {
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
  let newRecipe;
  try {
    newRecipe = await recipeData.createRecipe(title, ingredients, cookingSkillRequired, steps, user);
    return res.status(200).json({recipe: newRecipe});
  } catch(e) {
    return res.status(500).json({error: e});
  }
});

// PATCH /recipes/:id
router.patch('/:id', async (req, res) => {
  const requestBody = req.body;
  let updatedObject = {};
  try {
    req.params.id = validation.checkId(req.params.id, 'Post ID');4
    if(requestBody.title) {
      validation.checkIsProper(requestBody.title, 'string', 'title');
      requestBody.title = requestBody.title.trim();
      validation.checkString(requestBody.title, 2, 20, 'title', true, false, true);
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
  try {
    const oldRecipe = await recipeData.getRecipeById(req.params.id);
    if(requestBody.title && requestBody.title != oldRecipe.title)
      updatedObject.title = requestBody.title;
    if(requestBody.ingredients && !validation.checkArraysEqual(requestBody.ingredients, oldRecipe.ingredients))
      updatedObject.ingredients = requestBody.ingredients;
    if(requestBody.steps && !validation.checkArraysEqual(requestBody.steps, oldRecipe.steps))
      updatedObject.steps = requestBody.steps;
    if(requestBody.cookingSkillRequired && requestBody.cookingSkillRequired != oldRecipe.cookingSkillRequired)
      updatedObject.cookingSkillRequired = requestBody.cookingSkillRequired;
  } catch (e) {
    return res.status(404).json({error: `Recipe with id ${req.params.id} not found.`});
  }
  if(Object.keys(updatedObject).length !== 0) {
    try {
      const updatedRecipe = await recipeData.updateRecipe(req.params.id, updatedObject, req.session._id);
      return res.status(200).json(updatedRecipe);
    } catch (e) {
      return res.status(400).json({error: e});
    }
  } else {
    return res.status(400).json({error: 'No fields have been changed. Nothing to update.'});
  }
});

// POST /recipes/:id/comments
router.post('/:id/comments', async (req, res) => {
  let comment = req.body.comment || "";
  const user = {_id: req.session._id, username: req.session.username};
  try {
    req.params.id = validation.checkId(req.params.id, 'Id URL Param');
    validation.checkIsProper(comment, 'string', 'comment');
    comment = comment.trim();
    validation.checkString(comment, 1, 100, 'comment', true, true, true, true);
    const updatedRecipe = await recipeData.createComment(comment, req.params.id, user);
    return res.status(200).json(updatedRecipe);
  } catch (e) {
    return res.status(404).json({error: e});
  }
});

// DELETE /recipes/:recipeId/:commmentId
router.delete('/:recipeId/:commentId', async (req, res) => {
  try {
    req.params.recipeId = validation.checkId(req.params.recipeId, 'Recipe ID');
    req.params.commentId = validation.checkId(req.params.commentId, 'Comment ID');
  } catch (e) {
    return res.status(400).json({error: e});
  }
  try {
    let recipe = await recipeData.getRecipeById(req.params.recipeId);
    let commentExistsFlag = false;
    for (const comment of recipe.comments) {
      if(comment._id == req.params.commentId) {
        commentExistsFlag = true;
      }
    }
    if (!commentExistsFlag) {
      throw `Error: Could not find comment with id ${req.params.commentId} in recipe with id ${req.params.recipeId}.`;
    }
  } catch (e) {
    return res.status(404).json({error: e});
  }
  try {
    let removedComment = await recipeData.removeRecipeComment(req.params.recipeId, req.params.commentId, req.session._id);
    return res.status(200).json(removedComment);
  } catch (e) {
    return res.status(401).json({error: e});
  }
});

// POST /recipes/:id/likes
router.post('/:id/likes', async (req, res) => {
  let userId = req.session._id;
  let recipeId = req.params.id;

  // Check input
  try {
    userId = validation.checkId(userId, 'userId');
    recipeId = validation.checkId(recipeId, 'recipeId');
  } catch (e) {
    return res.status(400).json({error: e});
  }

  // Find recipe
  let recipe;
  try {
    recipe = await recipeData.getRecipeById(recipeId);
  } catch (e) {
    return res.status(404).json({error: e});
  }

  let alreadyLiked = false;
  for (const like of recipe.likes) {
    if(like == userId) {
      alreadyLiked = true;
    }
  }

  // Add/remove like
  try {
    let updatedRecipe = await recipeData.toggleLike(recipeId, userId, alreadyLiked);
    return res.status(200).json(updatedRecipe);
  } catch (e) {
    return res.status(500).json({error: e});
  }
});

module.exports = router;