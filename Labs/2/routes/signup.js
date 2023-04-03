const express = require('express');
const router = express.Router();
const validation = require('../validation');
const data = require('../data');
const userData = data.users;

// POST /signup
router.post('/', async (req, res) => {
    const userInfo = req.body;
    // Check that username and password are supplied in the req.body
    if (userInfo) {
      let username = userInfo.username;
      let name = userInfo.name;
      let password = userInfo.password;
      try {
        validation.checkIsProper(username, 'string', 'username');
        validation.checkString(username, 3, 20, 'username', true, true, false);
    
        validation.checkIsProper(name, 'string', 'name');
        validation.checkString(name, 2, 20, 'name', true, false, true)
    
        validation.checkIsProper(password, 'string', 'password');
        validation.checkString(password, 6, 50, 'password', false, false, false);
        validation.checkPassword(password);

      } catch (e) {
        return res.status(400).json({error: e});
      }
      try {
        newUser = await userData.createUser(username, name, password);
        return res.status(200).json(newUser);
      } catch (e) {
        return res.status(500).json({error: e});
      }
    }
});

module.exports = router;
