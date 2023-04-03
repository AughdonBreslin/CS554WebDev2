const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const validation = require('../validation');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const createUser = async function createUser(username, name, password) {
    // Error Checking
    validation.checkNumOfArgs(arguments,3,3);
    validation.checkIsProper(username, 'string', 'username');
    // NOTE: Check usernames with spaces/non-alphanumeric characters
    validation.checkString(username, 3, 20, 'username', true, true, false);

    validation.checkIsProper(name, 'string', 'name');
    validation.checkString(name, 2, 20, 'name', true, false, true)

    validation.checkIsProper(password, 'string', 'password');
    // NOTE: Check passwords with length < 6
    validation.checkString(password, 6, 50, 'password', false, false, false);
    validation.checkPassword(password);

    // Formatting
    username = username.trim();
    username = username.toLowerCase();
    password = password.trim();

    // Get database
    const userCollection = await users();
    if(!userCollection) throw `Error: Could not find userCollection.`;

    // Check if user already exists
    const user = await userCollection.findOne({username: username});
    if(user) throw `Error: User already exists with username ${username}.`;
    
    // Encrypt password (done after checking user so we dont waste time)
    const hash = await bcrypt.hash(password, saltRounds);

    // Create entry
    let newUser = {
        name: name,
        username: username,
        password: hash
    };

    // Add entry into database
    const insertInfo = await userCollection.insertOne(newUser);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw `Error: Could not add new user of username ${username}.`;    
    
    // Return newUser document (sans password)
    return {_id: insertInfo.insertedId, name: newUser.name, username: newUser.username};
}

const checkUser = async function checkUser(username, password) {
    // Error Checking
    validation.checkNumOfArgs(arguments,2,2);
    validation.checkIsProper(username, 'string', 'username');
    // NOTE: Check usernames with spaces/non-alphanumeric characters
    validation.checkString(username, 4, 20, 'username', true, true, false);
    validation.checkIsProper(password, 'string', 'password');
    // NOTE: Check passwords with length < 6
    validation.checkString(password, 6, 20, 'password', false, false, false);

    username = username.toLowerCase();
    // Get database
    const userCollection = await users();
    if(!userCollection) throw `Error: Could not find userCollection.`;

    // Check if user exists
    const user = await userCollection.findOne({username: username});
    if(!user) throw `Error: Either the username or password is invalid.`;

    const hash = user.password;
    let match = await bcrypt.compare(password, hash);

    // Failure
    if(!match) throw `Error: Either the username or password is invalid.`;
    
    // Success
    return {_id: user._id, username: user.username, name: user.name};
}

module.exports = {
    createUser,
    checkUser
}

