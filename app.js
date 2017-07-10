var express = require('express');
var app = express();
var mongoose = require('mongoose');
var passport = require('passport');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var session = require('express-session');
var userController = require(__dirname + "/server/controllers/user-controller");


//establish database connection
mongoose.connect('mongodb://localhost:27017/auth', function(){
  useMongoClient: true;
});

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB encountered an error!'));
db.once('open', function(){
  console.log("MongoDB connection now active!")
})


//setup app
app.use(cookieParser()); //read cookies
app.use(bodyParser.json()); //read json data
app.use(bodyParser.urlencoded({extended: false})); //read form data


//pre-reqs for passport
app.use(session({secret: 'mysecretkey'})); //set the secret key in express-session
app.use(passport.initialize());
app.use(passport.session()); //persistent login sessions
app.use(flash()); //use connect-flash to flash messages stored in the session


//other parameters
app.set('view-engine', 'ejs'); //set the view engine
app.listen(3000);


//routes
app.get("/", function(req,res){
  res.render('index.ejs')
});

app.get("/login", function(req,res){
  res.render('login.ejs', { message: req.flash('loginMessage')})
})

app.get('/signup', function(req,res){
  res.render('signup.ejs', { message: req.flash('signupMessage')})
})

app.post('/signup', userController.createUser);
app.post('/login',userController.loginUser);




//USER SECTION routes
//this must be protected; that is, you have to be logged in to visit. Use route middleware(isLoggedIn function) to verify this
app.get('/profile', isLoggedIn, function(req,res){
  res.render('profile.ejs', { user: req.user})
});

app.get('/logout', function(req,res){
  req.logout();
  res.redirect("/");
})



//middleware to verify that user is signed in
function isLoggedIn(req,res,next){

  //if user is authenticated, go on
  if(req.isAuthenticated()){
    console.log("User is authenticated")
    return next();
  }
  else{ //if not authenticated, redirect to homepage
    res.redirect("/");
  }
}
