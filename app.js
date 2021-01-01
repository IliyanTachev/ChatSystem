const express = require('express');
const port = 3000;

const app = express();
var path = require('path');
const Account = require('./entities/account.js');
const login = require('./login.js').login;
const register = require('./register.js').createAccount;

app.set("views", "views");
app.set("view engine", "html");
app.use(express.static('public'));
app.use(express.urlencoded());

// Users List
let accountList = [{email: 'iliqn@gmail.com', password: '12345'}];
let loggedAccount = null;

app.get('/', function(req, res){
  if(loggedAccount !== null) {
    res.sendFile(__dirname + "/public/homepage.html");
  }
  else {
    res.sendFile(__dirname + "/public/login.html");
  }
})

app.post('/login', function(req, res){
  let queryString = "";

  const loginResult =  login({'email': req.body.email, 'password': req.body.password}, accountList);

  if(!loginResult) queryString = "?" + "status=error";
  else loggedAccount = {...loginResult};

  res.redirect('/' + queryString);
})

app.get('/register', function(req, res){
  const registerResult = register(req.body);
  if(registerResult.status == "succcess") res.redirect("/login");
  else res.sendFile(__dirname + "/public/register.html");
})

app.get('/chat', function(req, res){
  res.render("views/chat.html");
})

app.listen(port, function(){
  console.log("Server started on port " + port + "...");
})