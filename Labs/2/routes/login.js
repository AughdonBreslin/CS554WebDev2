const express = require('express');
const router = express.Router();
const validation = require('../validation');
const data = require('../data');
const userData = data.users;

// POST /login
router.post('/', async (req, res) => {
    const userInfo = req.body;
    // Check that username and password are supplied in the req.body
    if (userInfo) {
        let username, password;
        try {
            username = userInfo.username;
            password = userInfo.password;
            validation.checkIsProper(username, 'string', 'username');
            validation.checkString(username, 3, 20, 'username', true, true, false);
        
            validation.checkIsProper(password, 'string', 'password');
            validation.checkString(password, 6, 50, 'password', false, false, false);
            validation.checkPassword(password);
        } catch (e) {
            //  Render the login screen once again, and this time showing an error message (along with an HTTP 400 status code) to the user explaining what they had entered incorrectly.
            return res.status(400).json({error: e});
        }
        try {
            let user = await userData.checkUser(username,password);
            req.session.username = user.username;
            req.session._id = user._id;
            return res.status(200).json(user);
        } catch (e) {
            return res.status(401).json({error: e});
        }
    }
});

module.exports = router;
