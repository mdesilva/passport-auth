var User = require('../datasets/users'); //get User model
var bcrypt = require('bcrypt-nodejs'); //password encryption
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


passport.serializeUser(function(user, done) {  //create cookie in session with the userId
  done(null, user.id);
});

passport.deserializeUser(function(id, done) { //delete cookie
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

//passport local Strategy - function that fires when called to authenticate user
passport.use(new LocalStrategy({passReqToCallback: true},
  function(req,username,password,done){
    User.findOne({username: username}, function(err,user){
      if(err){
        console.log(err)
        return done(err)
      }
      if(!user){ 
        console.log("User not found")
        return done(null, false, req.flash('loginMessage', 'Incorrect username'))
      }
                //encrypt and compare inputted password to the stored password
      if(user && (bcrypt.compareSync(password, user.password))){
        console.log("User found!")
        return done(null,user);
      }
      else{
        console.log("Wrong password");
        return done(null, false, req.flash('loginMessage', 'Wrong password'))
      }
    })
  }
))


module.exports.loginUser = passport.authenticate('local', {successRedirect: '/profile', failureRedirect: '/login', failureFlash: true})


module.exports.createUser = function(req, res){
  var user = new User();
  user.username = req.body.username;
  user.password = bcrypt.hashSync(req.body.password); //hash password syncronously
  user.save(function(err, docs){
    if(err){
      console.log(err)
    }
    else{
      res.send("Account creation successful")
      console.log("User " + user.username + " created successfully");
    }
  })

}
