const mongoCollections = require('../config/mongoCollections');
const recipes = mongoCollections.recipes;
const {ObjectId} = require('mongodb');
const validation = require('../validation');

const createRecipe = async function createRecipe(title, ingredients, cookingSkillRequired, steps, user) {
    // Error Checking
    validation.checkNumOfArgs(arguments,5,5);
    
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
    
    // Get database
    const recipeCollection = await recipes();
    if(!recipeCollection) throw `Error: Could not find recipeCollection.`;
    
    // Create entry
    let newRecipe = {
      title: title,
      ingredients: ingredients,
      cookingSkillRequired: cookingSkillRequired,
      steps: steps,
      userThatPosted: user,
      comments: [],
      likes: []
    };
    
    // Add entry into database
    const insertInfo = await recipeCollection.insertOne(newRecipe);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw `Error: Could not add new recipe.`;    
    
    // Return acknowledgement
    return newRecipe;
}

const updateRecipe = async function updateRecipe(id, updatedRecipe, userIdUpdating) {
    validation.checkNumOfArgs(arguments, 3, 3);
    id = validation.checkId(id);
    userIdUpdating = validation.checkId(userIdUpdating);
    
    const updatedRecipeData = {};
    
    if(updatedRecipe.title) {
        validation.checkIsProper(updatedRecipe.title, 'string', 'title');
        updatedRecipeData.title = updatedRecipe.title.trim();
        validation.checkString(updatedRecipe.title, 2, 20, 'title', true, false, true);
    }
    
    if(updatedRecipe.ingredients) {
        validation.checkStringArray(updatedRecipe.ingredients,'string', 'ingredients', 3, Infinity, 3, 50, true, false, true, true);
        updatedRecipeData.ingredients = validation.trimArray(updatedRecipe.ingredients);
    }
    
    if(updatedRecipe.steps) {
        validation.checkStringArray(updatedRecipe.steps, 'string', 'steps', 5, Infinity, 20, Infinity, true, false, true, true);
        updatedRecipeData.steps = validation.trimArray(updatedRecipe.steps);  
    }
    
    if(updatedRecipe.cookingSkillRequired) {
        validation.checkIsProper(updatedRecipe.cookingSkillRequired, 'string', 'cookingSkillRequired');
        updatedRecipeData.cookingSkillRequired = updatedRecipe.cookingSkillRequired.trim().toLowerCase();
        if(updatedRecipe.cookingSkillRequired != 'novice' && updatedRecipe.cookingSkillRequired != 'intermediate' && updatedRecipe.cookingSkillRequired != 'advanced')
          throw `Error: cookingSkillRequired '${updatedRecipe.cookingSkillRequired}' is invalid. Must be either 'Novice', 'Intermediate', or 'Advanced'.`  
    }
    
    const recipeCollection = await recipes();
    const recipe = await recipeCollection.findOne({_id: ObjectId(id)});
    if(!recipe) throw `Error: Recipe not found with ID ${id}.`
    if(recipe.userThatPosted._id != userIdUpdating)
        throw `Error: Cannot update other user's recipe.`;
    await recipeCollection.updateOne({_id: ObjectId(id)},{ $set: updatedRecipeData});
    return await this.getRecipeById(id);
}

const getAllRecipes = async function getAllRecipes(page) {
    // if(arguments.length < 1 || arguments.length > 1) throw `Error: Exactly 1 argument must be provided.`;
    validation.checkNumOfArgs(arguments,1,1);
    validation.checkIsProper(page, 'number', 'page');
    validation.checkInt(page, 'page', true);
    const recipeCollection = await recipes();
    const recipeList = await recipeCollection.find().skip((page-1)*50).limit(50).toArray();
    if(!recipeList) throw `Error: Could not find recipeCollection.`;
    if(recipeList.length == 0) throw `Error: There are not enough recipes to warrant this page.`;
    for(i in recipeList) {
        recipeList[i]._id = recipeList[i]._id.toString();
    }
    return recipeList;
}

const getRecipeById = async function getRecipeById(id) {
    validation.checkNumOfArgs(arguments,1,1);
    validation.checkIsProper(id,'string','ID');
    
    id = id.trim();
    // apparently this is a better check than ObjectId.isValid(), according to
    // https://stackoverflow.com/questions/13850819/can-i-determine-if-a-string-is-a-mongodb-objectid
    if(id != new ObjectId(id)) throw `Error: ID is not a valid ObjectId.`;
    
    const recipeCollection = await recipes();
    const recipe = await recipeCollection.findOne({ _id: ObjectId(id) });
    
    if (recipe === null) throw `Error: Recipe not found with ID ${id}.`;
    
    return recipe;
}

const createComment =  async function createComment(comment, recipeId, userThatPostedComment) {
    // Error Checking
    validation.checkNumOfArgs(arguments,3,3);

    validation.checkIsProper(comment, 'string', 'comment');
    comment = comment.trim();
    validation.checkString(comment, 1, 100, 'comment', true, true, true, true);    

    // Get database
    const recipe = await this.getRecipeById(recipeId);
    if(!recipe) throw `Error: Could not find recipe with id ${recipeId}.`;

    // Create entry
    let newComment = {
        _id: new ObjectId(),
        userThatPostedComment: userThatPostedComment,
        comment: comment
    };
    // Append new comment object
    recipe.comments.push(newComment);

    // Update recipe
    const recipeCollection = await recipes();
    let acknowledgement = await recipeCollection.updateOne({_id: ObjectId(recipeId)}, {$set: {comments: recipe.comments}});
    if(!acknowledgement.acknowledged) throw `Error: Could not update recipe with id ${recipeId}'s comments to be ${recipe.comments}.`;
    return await this.getRecipeById(recipeId);
}

const removeRecipeComment = async function removeRecipeComment(recipeId, commentId, userIdDeleting) {
    validation.checkNumOfArgs(arguments, 3, 3);
    recipeId = validation.checkId(recipeId);
    commentId = validation.checkId(commentId);
    userIdDeleting = validation.checkId(userIdDeleting);
    
    let recipeCollection = await recipes();
    let recipe = await recipeCollection.findOne({'_id': ObjectId(recipeId)});
    if(!recipe) throw `Error: No recipe with id ${recipeId}`;

    // dont actually need recipeId to find the right recipe, so manually check above
    recipe = await recipeCollection.findOne({'comments._id':ObjectId(commentId)});
    if(!recipe) throw `Error: No recipe with comment id ${commentId}`;
    for (const comment of recipe.comments) {
        if(comment._id == commentId) {
            if(comment.userThatPostedComment._id != userIdDeleting){
                throw `Error: Cannot delete other user's comment.`;
            }
            break;
        }
    }

    const deletionInfo = await recipeCollection.findOneAndUpdate({'comments._id':ObjectId(commentId)},
                                        {$pull:{comments:{_id: ObjectId(commentId)}}});

    if(!deletionInfo.lastErrorObject.updatedExisting)
        throw `Error: Could not find comment with id ${commentId} in recipe with id ${recipeId}.`;
    let removedCommentRecipe = await recipeCollection.findOne({_id: deletionInfo.value._id});
    return removedCommentRecipe;
}

const toggleLike = async function toggleLike(recipeId, userId, removeLike) {
    validation.checkNumOfArgs(arguments, 3, 3);
    userId = validation.checkId(userId, 'userId');
    recipeId = validation.checkId(recipeId, 'recipeId');
    validation.checkIsProper(removeLike, 'boolean', 'removeLike');

    let recipeCollection = await recipes();
    
    let deletionInfo;
    if(removeLike) {
        deletionInfo = await recipeCollection.findOneAndUpdate({'_id':ObjectId(recipeId)},
                                        {$pull:{likes: userId}});
    } else {
        deletionInfo = await recipeCollection.findOneAndUpdate({'_id':ObjectId(recipeId)},
                                        {$push:{likes: userId}});
    }

    if(!deletionInfo.lastErrorObject.updatedExisting)
        throw `Error: Could not find comment with id ${commentId} in recipe with id ${recipeId}.`;
    
    let updatedRecipe = await recipeCollection.findOne({_id: deletionInfo.value._id});
    return updatedRecipe;
}

module.exports = {
    createRecipe,
    updateRecipe,
    getAllRecipes,
    getRecipeById,
    createComment,
    removeRecipeComment,
    toggleLike
}