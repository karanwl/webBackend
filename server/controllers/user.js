//login controller

let User = require('../models/users');
let passport = require('passport');
let jwt = require('jsonwebtoken');
let config = require('../config/config');

const login = require('../config/local');



function getErrorMessage(err) {
    console.log("===> Erro: " + err);
    let message = '';
  
    if (err.code) {
      switch (err.code) {
        case 11000:
        case 11001:
          message = 'Username already exists';
          break;
        default:
          message = 'Something went wrong';
      }
    } else {
      for (var errName in err.errors) {
        if (err.errors[errName].message) message = err.errors[errName].message;
      }
    }
  
    return message;
  };
  
module.exports.signup = function(req, res, next) {
      console.log(req.body);
  
      let user = new User(req.body);

      console.log(user);
  
      user.save((err) => {
        if (err) {
          let message = getErrorMessage(err);
          return res.status(200).json(
            {
              success: false, 
              message: message
            }
          );

        }
        return res.json(
          {
            success: true, 
            message: 'User created successfully!'
          }
        );
      });
  };


  // module.exports.renderSignin = function(req, res, next) {
  //   if (!req.user) {
  //     res.render('auth/signin', {
  //       title: 'Sign-in Form',
  //       messages: req.flash('error') || req.flash('info')
  //     });
  //   } else {
  //     console.log(req.user);
  //     return res.redirect('/');
  //   }
  // };

 
module.exports.signin = function(req, res, next){
    passport.authenticate(
      "login",
      async (err, user, info) => {
        try {
          if (err || !user) {
            return res.status(200).json(
                { 
                  success: false, 
                  message: err || info.message
                }
              );
          }
      
          req.login(
              user,
              { session: false },
              async (error) => {
                if (error) {
                  return next(error);
                }
                const payload = { id: user._id, email: user.email };
                const token = jwt.sign(
                  { 
                    payload: payload
                  }, 
                  config.SECRETKEY, 
                  { 
                    algorithm: 'HS512', 
                    expiresIn: "20min"
                  }
                );
        
                return res.json(
                  { 
                    success: true, 
                    token: token ,
                    user:user
                  }
                );
              }
            );
          } catch (error) {
            // return next(error);
            console.log(error);
            return res.status(400).json({ success: false, message: error});
          }
        }
      )(req, res, next);
  } 