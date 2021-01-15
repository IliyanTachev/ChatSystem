jQuery(function(){
  var socket = io.connect('http://localhost:3000');
  socket.emit('user_connected', $("#loggedUser").attr("data-id"));
  socket.on('user_logged', (user) => {
    console.log("user = " + JSON.stringify(user));

    if(!checkIfUserAlreadyAdded(user.username)){
        updateOnlineUsers(user);
    }

    $(".friend").not("#new-room").click(function(){
        $("#chat-title > h4").text("Chatting with " + $(this).find(".friendName").html());
        $(".friend").removeClass("btn-success");
        $(this).addClass("btn-success");
    });
  });

  // Sending message
  $("#send-msg-btn").click(function(){
    let message = $('input[name="message"]').val();
    $("input[name='message']").val(''); // Clear message field
    $("#chat-body").append($("#loggedUser").text() + ": ").append(message).append("<br/>"); // Append message to current user's chat window

    socket.emit('chat-message', {
      senderId: $("#loggedUser").attr("data-id"),
      receiverId: $(".friend.btn-success .friendName").attr("data-id"),
      message
    });
  });

  // Retrieving message
  socket.on('chat-message', (data) => {
    $(".friend .friendName[data-id='" + data.senderId + "']").parent(".friend").click();
    $("#default-msg").remove();
    let senderUsername = $(".friend.btn-success").html();
    let messageFormat = senderUsername + ": " + data.message;
    $("#chat-body").append("<p class='new-response'>" + messageFormat + "</p>").append("<br/>");
  });

  socket.on('seen', (data) => {
    $(".chat-window .seen").remove();
    $("#chat-body").append("<p class='seen' style='color: blue;'>seen</p><br/>");
  });

  function updateOnlineUsers(user){
    let onlineUsersWrapper = $(".contacts");
    let noOnlineUsersText = $("#default-li");
    onlineUsersWrapper.find(noOnlineUsersText).remove();

    let onlineUserLayout = 
    '<div class="friend">' +
      '<img class="friendImg" src="images/preview.jpeg" width="45px">' +
      '<label data-id="' + user.id + '" class="friendName">' + user.username + '</label>' +
    '</div';

    onlineUsersWrapper.append(onlineUserLayout);
  }

  function checkIfUserAlreadyAdded(username){
    let onlineUsersElements = $(".contacts .friend .friendName");
    for(let onlineUserElement of onlineUsersElements){
       if(onlineUserElement.innerHTML == username) return true;
    }

    return false;
  }

  $(".chat-window").click(function(){
    if(
      $(".new-response").length &&
      $(".friend.btn-success").length == 1
      ) { // if any responses and if any chat is opened 
      $(".new-response").removeClass("new-response").addClass("response");
      socket.emit('seen', {receiverId: $(".friend.btn-success .friendName").attr("data-id")});
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
          console.log("roomParticipants = " + roomParticipants);
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
                $(".groups").append('<button class="room" type="button">' + roomName + '</button>');
              }
            }
          });
      });

      }
    });
  });
});