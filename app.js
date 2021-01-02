const port = 3000;

var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var url  = require('url');

var path = require('path');
const Account = require('./entities/account.js');
const login = require('./login.js').login;
const register = require('./register.js').createAccount;

app.set("views", "views");
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded());

// Users List
let accountList = [{email: 'iliqn', password: '123', username: 'iliyant.'}];
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
  res.sendFile(__dirname + "/public/register.html");
})

app.post("/register", function(req, res){
  const registerResult = register(req.body, accountList);
 
  if(registerResult.status == "success") res.redirect("/");
  else res.sendFile(__dirname + "/public/register.html");
})

app.get('/chat', function(req, res){
  res.render('chat', {user : loggedAccount});
})

io.on('connection', (socket) => {
  console.log("new user connected");

  socket.on('chat-message', (msg) => {
    console.log('message: ' + msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
})




http.listen(port, function(){
  console.log("Server started on port " + port + "...");
})