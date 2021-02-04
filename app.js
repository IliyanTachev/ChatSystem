const port = 3001;
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
  let loggedUser = {
    id: req.user[0]._id,
    username: req.user[0].username 
  };

  let onlineUsers = await db.findAllLoggedUsers(loggedUser.id); // dont fetch loggedUser

  console.log("found users = " + onlineUsers.length);

  // Optimize... (calculates number of unseen msgs is any)
  for(let i=0;i<onlineUsers.length;i++){
    let user = onlineUsers[i];
    if(user._id == loggedUser.id) continue;
    
    let sortedMessages = await db.findAllMessages(user._id, loggedUser.id, options = {mode: 'strict', order: 'DESC'});
    console.debug("sorted = " + JSON.stringify(sortedMessages));
    console.log("sorted length" + sortedMessages.length);

    if(sortedMessages.length > 0){ // if any messages
      if(sortedMessages[0].seen_by_receiver == '1') continue; // last message (no unseen messagess
      else {
        let unseenMsgCounter = 1;
        for(let i=1;i<sortedMessages.length;i++){
          if(sortedMessages[i].seen_by_receiver == '1') {
            break;
          }
          unseenMsgCounter++;
        }
        user['unseenMessages'] = unseenMsgCounter;
      }
    }
  }

  console.log("users = " + JSON.stringify(onlineUsers));
  
  res.render('homepage', {
    loggedUser,
    onlineUsers
  });

  // res.render('chat', {
    // loggedUser: req.user[0],
    // onlineUsers
  // });
});

app.get('/chat', async function(req, res){
  let onlineUsers = await db.findAllLoggedUsers(req.user[0]._id);

  res.render('chat', {
    loggedUser: req.user[0],
    onlineUsers
  });
});

app.get('/fetch/users', async function(req, res){
  let onlineUsers = await db.findAllLoggedUsers(req.user[0]._id);
  res.send(onlineUsers);
});

io.on('connection', (socket) => {
  console.log("new user connected -> " + socket.id);

  socket.on('user_connected', async (userId) => {
    await db.setSocketId(userId, socket.id);
    // let onlineUsers = await db.findAllLoggedUsers(); // to remove
    console.log("userId = " + userId);
    let updatedUserUsername = (await db.findById("users", userId, ["username"]))[0].username; // retrieve username

    io.emit('user_logged', {id: userId, username: updatedUserUsername});
  });

  socket.on('chat-message', async (data) => {
    let receiver = (await db.findById("users", data.receiverId , ["socket_id"]))[0].socket_id; // retrieve socket_id
    io.to(receiver).emit('chat-message', {senderId: data.senderId, message: data.message});
    const msg = {
      'sender_id': data.senderId,
      'receiver_id': data.receiverId,
      'message': data.message
    }

    await db.insertOne('messages', msg);
  });

  socket.on('seen', async (data) => {
    let sender = (await db.findById("users", data.senderId , ["socket_id"]))[0].socket_id; // retrieve socket_id
    io.to(sender).emit('seen', {receiverId: data.receiverId});
    await db.setSeenMessageStatus(data.senderId, data.receiverId);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
})

// Create new room
app.post('/create/room', async function(req, res){
  let roomName = req.body.roomName;
  let roomAdmin = req.body.roomAdminId;
  let roomParticipants =  (req.body.participants).push(roomAdmin);

  let fetchedUsers = (await db.findAllUsersByIds(roomParticipants, ["socket_id", "username"]));
  console.log(JSON.stringify(fetchedUsers));

  let createdRoomId = await db.createRoom(roomName, roomAdmin, roomParticipants, fetchedUsers.map(u => u.username));

  for(let user of fetchedUsers){
    io.sockets.sockets.get(user.socket_id).join(createdRoomId);
  }

  let createdRoomData = {roomName, createdRoomId};
  res.json(JSON.stringify(createdRoomData));
});

app.post('/fetch/messages', async function(req, res){
  let messages = await db.findAllMessages(req.body.senderId, req.body.receiverId);
  res.send(messages);
});

app.post('/addFriend', async function(req, res){
  let parsedForm = req.body.formData.split("&");
  console.log(parsedForm);
  parsedForm[0] = parsedForm[0].split("=")[1];
  parsedForm[1] = parsedForm[1].split("=")[1];
  let result = await db.findUserByUsernameAndCode(parsedForm[0], parsedForm[1]);
  if(result) res.send("success");
  else res.send("error");
});

http.listen(port, function(){
  console.log("Server started on port " + port + "...");
})