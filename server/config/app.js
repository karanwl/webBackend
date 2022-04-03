// moddules for node and express
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let cors = require('cors');
let compression = require('compression');
let passport = require('passport');
let errorHandler = require('./error-handler');
const LocalStrategy = require('passport-local').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const JWTstrategy = require('passport-jwt').Strategy;
const User = require('../models/users');

const config = require('./config');

//import "mongoose" - required for DB Access
let mongoose = require('mongoose');
let DB = require('./db');

mongoose.connect(process.env.URI || DB.URI, {useNewUrlParser: true, useUnifiedTopology: true});

let mongoDB = mongoose.connection;
mongoDB.on('error', console.error.bind(console, 'Connection Error:'));
mongoDB.once('open', ()=> {
 console.log("Connected to MongoDB...");
});

// define routers
let index = require('../routes/index'); // top level routes
let surveys = require('../routes/surveys'); // routes for surveys
let users = require('../routes/users'); // routes for users

let app = express();

app.use(cors());
app.options('*', cors());

app.use(compression());

// view engine setup
//app.set('views', path.join(__dirname, '../views'));
//app.set('view engine', 'ejs');

// uncomment after placing your favicon in /client
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, '../../client')));

// route redirects
app.use(passport.initialize());
app.use('/', index);
app.use('/surveys', surveys);
app.use('/users', users);
app.use(errorHandler);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json(
    { 
      statusCode: 404, 
      message: "The endpoint does not exist."
    }
  );
});

passport.use(
  'tokencheck',
  new JWTstrategy(
      {
          secretOrKey: config.SECRETKEY,
          jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
      },
      async (token, done) => {
          try {
              console.log(token);
              return done(null, token.payload);
          } catch (error) {
              console.log(error);
              done(error);
          }
      }
  )
);

passport.use(
  'login',
  new LocalStrategy(
      {
          usernameField: 'username',
          passwordField: 'password'
      },
      authLocal
  )
);


function authLocal(username, password, done){
console.log('====> authLocal function');

User.findOne({username: username}, (err, user)=>{
  if (err) {
      return done(err);
  }
  
  if (!user) {
      return done(null, false, { message: 'Unknown user' });
  }

  if (!user.authenticate(password)) {
      return done(null, false, { message: 'Invalid password'});
  }
  
  return done(null, user);
});
}

module.exports = app;
