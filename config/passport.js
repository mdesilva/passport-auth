
//load passport local strategy
var localStrategy = require('passport-local').Strategy;

//load the user model

var User = require('../users');

module.exports = function(passport){
  //passport session setup

  //required for persistent loginMessage
  console.log("Passport initialized")
  passport.serializeUser(function(user,done){
    done(null,user.id);
  })

  passport.deserializeUser(function(id, done){
    User.findById(id, function(err,user){
      done(err, user);
    });
  });

  //local signup
  passport.use('local-signup', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done){
    process.nextTick(function(){
      User.findOne({email: email}, function(err, user){
        if(err){
          return done(err);
        }

        if(user) {
          return done(null, false, req.flash('signupMessage', 'That email is already taken. '));
        }
        else{
          var newUser = new User();
          newUser.email = email;
          newUser.password = newUser.generateHash(password);

          newUser.save(function(err){
            if(err){
              return err;
            }
            else{
              console.log("User " + newUser.email + " created.")
              return done(null, newUser)
            }
          })
        }
      })
    })
  }
))


}
