const recipesRoutes = require('./recipes');
const signupRoutes = require('./signup');
const loginRoutes = require('./login');

const redis = require('redis');
const client = redis.createClient();
client.connect().then(() => {});

const constructorMethod = (app) => {
  app.get('/', (req, res) => {
    if(req.session.username) {
      res.status(200).redirect('/recipes').json({status: 'Defaulting to /recipes/.'});
    } else {
      res.status(200).redirect('/login').json({status: 'Log in please.'});
    }
  });

  app.use('/signup', signupRoutes);
  app.use('/login', loginRoutes);
  app.use('/recipes', recipesRoutes);

  app.get('/mostaccessed', async (req, res) => {
    let recipesVisited = await client.zRangeWithScores('recipesVisited',-10,-1);
    let parsedRecipesVisited = []
    for(let i = 0; i < recipesVisited.length; i++) {
      parsedRecipesVisited.push(JSON.parse(recipesVisited[i].value));
    }
    parsedRecipesVisited = parsedRecipesVisited.reverse();
    return res.status(200).json(parsedRecipesVisited);
  });

  // User is logged in and is not having it
  app.get('/logout', (req, res) => {
    if(req.session.username) {
      return req.session.destroy(function (err) {
        res.status(200).json({status: 'Logged out successfully.'});
      });
    } else {
      return res.status(400).json({error: 'Error: Cannot logout when not logged in.'});
    }
  });

  app.use('*', (req, res) => {
    res.sendStatus(404).json({error: 'Error: Unrecognized route.'});
  });
};

module.exports = constructorMethod;
