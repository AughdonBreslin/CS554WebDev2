const express = require('express');
const app = express();
const session = require('express-session');
const static = express.static(__dirname + '/public');
const configRoutes = require('./routes');
const redis = require('redis');
const client = redis.createClient();
client.connect().then(() => {});

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }

  // let the next middleware run:
  next();
};

app.use;
app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(rewriteUnsupportedBrowserMethods);

/* Authentication Routing */
app.use(
  session({
    name: 'AuthCookie',
    secret: "This is a secret.. shhh don't tell anyone",
    saveUninitialized: true,
    resave: false,
    cookie: {maxAge: 1200000} //20 min
  })
);

// User is not logged in and trying to access logged-in pages
app.use('/recipes', (req, res, next) => {
  if (!req.session.username && req.method != 'GET') {
    return res.status(401).json({error: 'Must be logged in to access.'});
  } else {
    next();
  }
});

// User is logged in and trying to access not-logged-in pages
app.use('/signup', (req, res, next) => {
  if (req.session.username) {
    return res.status(400).redirect('/recipes');
  } else {
    next();
  }
});
app.use('/login', (req, res, next) => {
  if (req.session.username) {
    return res.status(400).redirect('/recipes');
  } else {
    next();
  }
});

/* Logging */
const routesVisitedCounter = {};
app.use(async (req, res, next) => {
  let reqUrl = req.url;
  if(!(reqUrl in routesVisitedCounter)){
    routesVisitedCounter[reqUrl] = 1;
  } else {
    routesVisitedCounter[reqUrl] += 1;
  }
  console.log(`[${new Date().toUTCString()}]: ${req.method} | URL: ${req.url} | VisitCount: ${JSON.stringify(routesVisitedCounter[reqUrl])} | Req.Body: ${req.body.password ? JSON.stringify({username: req.body.username, name: req.body.name}) : JSON.stringify(req.body)} | Auth: (${req.session.username ? 'Authenticated User' : 'Non-Authenticated User'})`);
  next();
});

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
