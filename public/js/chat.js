jQuery(function(){
  // Global Selectors
  var loggedUser = {
    id: $("#loggedUser").attr("data-id"),
    username: $("#loggedUser").attr("data-username")
  };

  var socket = io.connect('http://localhost:3000');
  socket.emit('user_connected', loggedUser.id);
  socket.on('user_logged', (user) => {
    if(!checkIfUserAlreadyAdded(user.username)){
        updateOnlineUsers(user);
    }

    // Click on friend
    $(".friend").click(function(){
      // Remove unchecked messages number
      if($(this).hasClass("unchecked")){
        $(this).find(".unchecked-num").remove();
        $(this).removeClass("unchecked");
      }

      let receiverUsername = $(this).attr("data-username");

      $(".chat-title").text("Chatting with " + receiverUsername);

      // Prevent from fetching messages when it is not needed
      if($(this).hasClass("active") === false){
          $(".chat-body").empty(); // clear msg box
          $.ajax({
            url: '/fetch/messages',
            method: 'POST',
            data: {senderId: loggedUser.id, receiverId: $(this).attr("data-id")},
            success: function(messages){
              messages.forEach(messageObj => {
                let style = loggedUser.username == messageObj.senderUsername ? 'style="display:flex;justify-content:flex-end;"' : ""; // Display loggedUser msgs on right
                let messageLayout = '<div class="message-wrapper" ' + style + '>' +
                                        '<div><label class="username"><strong><i>' + messageObj.senderUsername + '</i></strong></label></div>' +
                                        '<div><p class="message">' + messageObj.message + '</p></div>' +
                                    '</div>';
                $(".chat-body").append(messageLayout);
              });

              $(".chat-body").scrollTop($(".chat-body").prop("scrollHeight"));
            }
          });
        }

        $(".friend").removeClass("active"); // Remove active from all other friends 
        $(this).addClass("active");
    });
  });

  // Sending message
  $("#send-msg-btn").click(function(){
    let message = $('input[name="message"]').val();
    $("input[name='message']").val(''); // Clear message field

    let style = 'style="display:flex;justify-content:flex-end;"';
    let messageLayout = '<div class="message-wrapper" ' + style + '>' +
                            '<div><label class="username"><strong><i>' + loggedUser.username + '</i></strong></label></div>' +
                            '<div><p class="message">' + message + '</p></div>' +
                        '</div>';

    $(".chat-body").append(messageLayout); // Append message to current user's chat window

    socket.emit('chat-message', {
      senderId: loggedUser.id, 
      receiverId: $(".friend.active").attr("data-id"),
      message
    });
  });

  // Receiving message
  socket.on('chat-message', (data) => {
    let senderFriend = $(".friend[data-id='" + data.senderId + "']");
    if(senderFriend.hasClass("active")) {
      let senderUsername = senderFriend.attr("data-username");
      let messageFormat = senderUsername + ": " + data.message;
      $(".chat-body").append("<p class='new-response'>" + messageFormat + "</p>").append("<br/>");
    } else {
      if(senderFriend.hasClass("unchecked")){
        let uncheckedMessagesNumber = Number(senderFriend.find(".unchecked-num").html());
        senderFriend.find(".unchecked-num").html(uncheckedMessagesNumber+1);
      } else {
        senderFriend.append('<span class="unchecked-num"></span>');
        senderFriend.addClass("unchecked");
        senderFriend.find(".unchecked-num").html(1);
      }
    }
  });

  // On seen
  socket.on('seen', (data) => {
    $(".chat-window .seen").remove();
    $(".chat-body").append("<p class='seen' style='color: blue;'>seen</p><br/>");
  });

  $(".chat-window").click(function(){
    if(
      $(".new-response").length &&
      $(".friend.active").length == 1
      ) { // if any responses and if any chat is opened 
      $(".new-response").removeClass("new-response").addClass("response");
      socket.emit('seen', {receiverId: $(".friend.active").attr("data-id")});
    }
  });

  // Rooms
  roomParticipants = [];

  $("#new-room").click(function(){
    $("#create-room-form-wrapper").show();
    $.ajax({
      url: '/fetch/users',
      method: 'GET',
      success: function(data){
        for(let onlineUser of data){
          $("#create-room-form-wrapper > div#online-users").append('<button type="button" class="room-online-user btn btn-primary" data-id="' + onlineUser._id + '">' + onlineUser.username + '</button>');
        }


        $(".room-online-user").click(function(){
          if($(this).hasClass("chosen")){
            $(this).removeClass("btn-success").addClass("btn-primary"); // styling
            $(this).removeClass("chosen");
            // Remove participant from room
            let id = $(this).attr("data-id");
            for(let i=0;i<roomParticipants.length;i++) {
              if(roomParticipants[i] == id) {roomParticipants.splice(i, 1); break};
            }
          } else {
            $(this).removeClass("btn-primary").addClass("btn-success"); // styling
            $(this).addClass("chosen");
            roomParticipants.push($(this).attr("data-id"));
          }
        });


        $("#create-room-form-wrapper #create-room").click(function(){
          let roomName = $("#room-name").val();

          $.ajax({
            url: '/create/room',
            method: 'POST',
            data: {roomName, participants: roomParticipants},
            success: function(data){
              if(data == "success"){
                $("#create-room-form-wrapper").hide();
                alert("You successfully created new group.");
              }
            }
          });
      });

      }
    });
  });

  socket.on('added_to_new_room', (data) => {
    let roomLayout = 
    '<div class="friend">' +
      '<img class="friendImg" src="images/preview.jpeg" width="45px">' +
      '<label data-name="' + data.roomName + '" class="friendName">' + data.roomName + '</label>' +
    '</div';

    $(".groups").append(roomLayout);
  });
});

// Additional functions
function updateOnlineUsers(user){
  let onlineUsersWrapper = $(".contacts");
  let noOnlineUsersText = $("#default-li");
  onlineUsersWrapper.find(noOnlineUsersText).remove();

  let onlineUserLayout = 
  '<div class="friend" data-id="' + user.id + '" data-username="' + user.username + '">' +
    '<img class="friendImg" src="images/preview.jpeg" width="45px">' +
    '<label data-id="' + user.id + '" class="friendName">' + user.username + '</label>' +
  '</div';

  onlineUsersWrapper.append(onlineUserLayout);
}

function checkIfUserAlreadyAdded(username){
  let onlineUsersElements = $(".contacts .friend");
  for(let onlineUserElement of onlineUsersElements){
     if($(onlineUserElement).attr("data-username") == username) return true;
  }

  return false;
}