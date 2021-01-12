const port = 3000;
const express = require('express');
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const cookieParser = require('cookie-parser');
const session = require('express-session');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const passport = require('passport');
const authRouter = require('./auth');
const db = require('./database').database;

app.set("views", "views");
app.set("view engine", "ejs");
app.use(express.static('public'));

app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat !@#',
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRouter);

app.use(function(req, res, next){ // isLogged
  if(req.user !== undefined) next(); 
  else res.redirect('/auth/login');
});

app.get('/', async function(req, res){
  let onlineUsers = await db.findAllLoggedUsers();

  res.render('chat', {
    loggedUser: req.user[0],
    onlineUsers
  });
})

io.on('connection', (socket) => {
  console.log("new user connected -> " + socket.id);

  socket.on('user_connected', async (userId) => {
    await db.setSocketId(userId, socket.id);
    let onlineUsers = await db.findAllLoggedUsers(); // to remove
    let updatedUserUsername = (await db.findById("users", userId, ["username"]))[0].username; // retrieve username

    io.emit('user_logged', {id: userId, username: updatedUserUsername});
  });

  socket.on('chat-message', async (data) => {
    let receiver = (await db.findById("users", data.receiverId , ["socket_id"]))[0].socket_id; // retrieve socket_id
    io.to(receiver).emit('chat-message', {senderId: data.senderId, message: data.message});
  });

  socket.on('seen', async (data) => {
    let receiver = (await db.findById("users", data.receiverId , ["socket_id"]))[0].socket_id; // retrieve socket_id
    io.to(receiver).emit('seen', {receiverId: data.receiverId});
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
})



http.listen(port, function(){
  console.log("Server started on port " + port + "...");
})