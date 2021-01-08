const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const router = require('express').Router();
const register = require('./register.js').createAccount;
const db = require('./database').database;

passport.use(new LocalStrategy(
  {usernameField: 'email', passwordField: 'password'},
  async function(email, password, done) {

    let user = await db.findByEmailAndPassword({email, password});

    if (!user) {
      done(null, false, { message: 'Incorrect username or password.' });
    }
    
    done(null, user);
  }
));

passport.serializeUser(function(user, done) {
  if(user) done(null, user._id);
});

passport.deserializeUser(async function(id, done) {
  let user = await db.findById("users", id);
  if (!user) return done(null, false);
  if (user) return done(null, user);
});

router.get('/login', function(req, res){
  res.sendFile(__dirname + "/public/login.html");
})

router.post('/login', passport.authenticate('local'), async function(req, res){
  await db.updateLoginStatus(req.user._id, true);
  res.redirect('/');
})

router.get('/register', function(req, res){
  res.sendFile(__dirname + "/public/register.html");
})

router.post("/register", async function(req, res){
  const registerResult = await register(req.body);
 
  if(registerResult.status == "success") {
    let user = registerResult.user;
   
    req.login(user, async function(err) { 
      if(err) {
        console.log("Something went wrong"); // TODO flash message 
        res.redirect("/auth/register");
        return;
      }
      
      await db.updateLoginStatus(req.user._id, true);
      return res.redirect("/");
    });
  } else {
    res.redirect('/auth/register');
  }
})

router.post('/logout', async function(req, res){
  req.logout();
  await db.updateLoginStatus(req.user._id, false);
  res.redirect('/auth/login');
});

module.exports = router;
