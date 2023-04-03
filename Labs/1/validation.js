const {ObjectId} = require('mongodb');

/**
 * Arg counting
 */
const checkNumOfArgs = function checkNumOfArgs(args, numArgsLow, numArgsHigh) {
  if(args.length < numArgsLow || args.length > numArgsHigh)
   throw (numArgsLow == numArgsHigh)
   ? ((numArgsLow == 1) 
      ? `Error: Exactly ${numArgsLow} argument must be provided.`
      : `Error: Exactly ${numArgsLow} arguments must be provided.`)
   : `Error: Number of arguments must be in range [${numArgsLow}, ${numArgsHigh}].`;
};

/**
 * Arg typing
 */
const checkIsProper = function checkIsProper(val, varType, variableName) {
  if(!val && typeof val != 'boolean') throw `Error: ${variableName || 'Variable'} is not defined.`;
  // Check parameter type is correct (also checks if its defined)
  if (typeof val != varType) throw `Error: ${variableName || 'provided variable'} must be a ${varType}.`;

  // Also required to catch NaNs since theyre technically type 'number'
  if (varType == 'number' && isNaN(val)) throw `Error: ${variableName || 'provided variable'} must not be NaN.`;
  
  // For strings, check if trimmed string is empty
  if(varType == 'string' && val.trim().length < 1) throw (1 == 1)
   ? `Error: Trimmed ${variableName || 'provided variable'} cannot be empty.`
   : `Error: Trimmed ${variableName || 'provided variable'} must be at least ${length} characters long.`;
};


const checkInt = function checkInteger(num, numName, mustBePositive) {
  checkIsProper(num, 'number', numName);
  if(isNaN(num) || !Number.isInteger(num)) throw `Error: ${numName} must be a valid integer.`;
  if(mustBePositive && num < 1) throw `Error: Integer ${numName} must be greater than 0.`;
}


const checkString = function checkString(strVal, minLength = 0, maxLength = Infinity, varName = '', alpha = true, numeric=true, spacesOk=true, specialCharOk = false) {
  if (!strVal) throw `Error: You must supply a ${varName}!`;
  if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
  strVal = strVal.trim().toLowerCase();

  if (strVal.length < minLength)
    throw `Error: Trimmed ${varName} must be at least ${minLength} characters long.`;
  if (strVal.length > maxLength)
    throw `Error: Trimmed ${varName} must be no more than ${maxLength} characters long.`;

  if (!spacesOk && strVal.includes(' '))
    throw `Error: ${varName} cannot contain spaces.`;

  if (alpha && !(/[a-zA-z]/.test(strVal)))
    throw `Error: ${varName} must contain some letters.`;

  // Check if all characters fall within 0-9 and a-z
  if (alpha && numeric && !specialCharOk && !strVal.match(/^[0-9a-z]+$/))
    throw `Error: ${varName} must be alphanumeric.`;
  if (alpha && !numeric && !specialCharOk && !strVal.match(/^[a-z ]+$/))
    throw `Error: ${varName} must only be alphabetic.`;
  if (!alpha && numeric && !specialCharOk && !strVal.match(/^[0-9]+$/))
    throw `Error: ${varName} must only be numeric.`;

  return strVal;
}

const checkArray = function checkArray(array, elemType, arrName, minArrayLength, maxArrayLength, minElemLength, maxElemLength) {
  if(!Array.isArray(array)) throw `Error: ${arrName} must be an array.`;
  if(array.length < minArrayLength || array.length > maxArrayLength) throw `Error: ${arrName} must have length within [${minArrayLength}, ${maxArrayLength}].`;
  for (const elem of array) {
      checkIsProper(elem, elemType,`Within ${arrName}, ${elem}`);
      if(elemType == 'string') {
        checkString(elem, minElemLength, maxElemLength, `Within ${arrName}, ${elem}`, true, false, true);
      }
      if(elemType == 'number') {
        checkInt(num, `Within ${arrName}, ${elem}`);
      }
  }
};
const checkStringArray = function checkStringArray(array, elemType, arrName, minArrayLength, maxArrayLength, minElemLength, maxElemLength, alpha, numeric, spacesOk, specialCharOk) {
  if(!Array.isArray(array)) throw `Error: ${arrName} must be an array.`;
  if(array.length < minArrayLength || array.length > maxArrayLength) throw `Error: ${arrName} must have length within [${minArrayLength}, ${maxArrayLength}].`;
  for (const elem of array) {
      checkIsProper(elem, elemType,`Within ${arrName}, ${elem}`);
      checkString(elem, minElemLength, maxElemLength, `Within ${arrName}, ${elem}`, alpha, numeric, spacesOk, specialCharOk);
  }
};

/**
 * Arg formatting
 */
const checkId = function checkId(id, varName) {
  if (!id) throw `Error: You must provide a ${varName}`;
  if (typeof id !== 'string') throw `Error:${varName} must be a string`;
  id = id.trim();
  if (id.length === 0)
    throw `Error: ${varName} cannot be an empty string or just spaces`;
  
  // apparently this is a better check than ObjectId.isValid(), according to
  // https://stackoverflow.com/questions/13850819/can-i-determine-if-a-string-is-a-mongodb-objectid
  if(id != new ObjectId(id)) throw `Error: ID is not a valid ObjectId.`;
  
  return id;
};
const checkPassword = function checkPassword(password) {
  if(password.length < 6) throw `Error: Password must be at least 6 characters.`;
  // https://www.geeksforgeeks.org/check-if-a-string-contains-uppercase-lowercase-special-characters-and-numeric-values/#:~:text=Traverse%20the%20string%20character%20by,it%20is%20a%20lowercase%20letter.
  let pattern = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[-+_!@#$%^&*.,?]).+$"
  );
  if(!pattern.test(password)) throw `Error: Password must contain at least one lowercase letter, one uppercase letter, one number and one special character.`
}
const checkYear = function checkYear(year) {
  if (isNaN(year) || !Number.isInteger(year) || year < 1900 || year > 2023) throw `Error: Year must be a number within the range [1900,2023].`;
};
const checkDate = function checkDate(date) {
  if (date.length != 10) throw `Error: Date must be in form 'MM/DD/YYYY'.`;
  let year = parseInt(date.substr(-4));
  checkYear(year);
}
const checkWebsite = function checkWebsite(website) {
  if (website.indexOf('http://www.') != 0) throw `Error: Website ${website} must begin with 'http://www.'.`;
  if (website.indexOf('.com') == -1
      || website.substr(website.indexOf('.com')+4) != "") throw `Error: Website ${website} must end with '.com'.`;
  if (website.length < 20) throw `Error: There must be at least 5 characters in between 'http://www.' and '.com'.`
};


/**
 * Specific arg checks
 */
const checkWithinBounds = function checkWithinBounds(num, lower, upper) {
  if(num < lower || num > upper) throw `Error: ${numName} must be within [${lower}, ${upper}].`;
}

const checkRating = function checkRating(rating) {
  if(rating < 1 || rating > 5) throw `Error: Rating must be a number within the range [1,5].`;
}
const checkTracks = function checkTracks(array, elemType, arrName) {
  if(!Array.isArray(array)) throw `Error: ${arrName} must be an array.`;
  if(array.length < 3) throw `Error: ${arrName} must contain at least three tracks.`;
  for (const elem of array) {
      checkIsProper(elem,elemType,`Within ${arrName}, ${elem}`);
  }
}
const trimArray = function trimArray(array) {
  for (i in array) {
      array[i] = array[i].trim();
  }
  return array;
};
// check array equality (taken from https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript)
const checkArraysEqual = function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}


module.exports = {
  checkArraysEqual,
  checkId,
  checkInt,
  checkWithinBounds,
  checkString,
  checkStringArray,  
  checkNumOfArgs,
  checkIsProper,
  checkArray,
  checkWebsite,
  checkYear,
  trimArray,
  checkRating,
  checkDate,
  checkPassword,
  checkTracks
};
