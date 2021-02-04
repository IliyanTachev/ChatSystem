jQuery(function(){
  // Global Selectors
  var loggedUser = {
    id: $("#loggedUser").attr("data-id"),
    username: $("#loggedUser").attr("data-username")
  };

  var socket = io.connect('http://localhost:3001');
  socket.emit('user_connected', loggedUser.id);
  socket.on('user_logged', (user) => {
    if(!checkIfUserAlreadyAdded(user.username)){
        updateOnlineUsers(user, loggedUser);
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
                                        '<div><label class="username" style="padding-right:5px;"><strong><i>' + messageObj.senderUsername + '</i></strong></label></div>' +
                                        '<div><p class="message new-response">' + messageObj.message + '</p></div>' +
                                    '</div>';
                $(".chat-body").append(messageLayout);

                // Add seen html
                if(messageObj.seen_by_receiver == '1') {
                  $(".chat-body .seen").remove();
                  $(".chat-body").append("<p class='seen' style='color: blue;display:flex;justify-content:flex-end;'>seen</p><br/>");
                }
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
                            '<div><label class="username" style="padding-right:5px;"><strong><i>' + loggedUser.username + ' </i></strong></label></div><br>' +
                            '<div><p class="message"> ' + message + '</p></div>' +
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
      let messageLayout = '<div class="message-wrapper">' +
                                        '<div><label class="username" style="padding-right:5px;"><strong><i>' + senderUsername + '</i></strong></label></div>' +
                                        '<div><p class="message new-response">' + data.message + '</p></div>' +
                                    '</div>';

      $(".chat-body").append(messageLayout);
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
    if($(".friend.active").attr("data-id") == data.receiverId){
      $(".chat-body .seen").remove();
      $(".chat-body").append("<p class='seen' style='color: blue;display:flex;justify-content:flex-end;'>seen</p><br/>");
    }
  });

  $("section.chatSection").click(function(){
    if(
      $(".new-response").length &&
      $(".friend.active").length == 1
      ) { // if any responses and if any chat is opened 
      $(".new-response").removeClass("new-response").addClass("response");
      $(".friend.active .unchecked-num").remove();
      socket.emit('seen', {
        senderId: $(".friend.active").attr("data-id"),
        receiverId: loggedUser.id
      });
    }
  });

  // Rooms

  $("#new-room").click(function(){
    // $("#create-room-form-wrapper").show();
    $.ajax({
      url: '/fetch/users',
      method: 'GET',
      success: function(data){
        for(let onlineUser of data){
          // $("#create-room-form-wrapper > div#online-users").append('<button type="button" class="room-online-user btn btn-primary" data-id="' + onlineUser._id + '">' + onlineUser.username + '</button>');
          if(!checkIfUserAlreadyDisplayedToGroup(onlineUser.username)){
            $(".createGroupModalContentGrid .listOfFriends#all .allFriends").append(
              '<div class="friendInList" data-id="' + onlineUser._id + '" data-username="' + onlineUser.username + '">' +
                '<img class="friendInListImg" src="images/preview.jpeg" width="30px">' +
                '<label class="friendInListName">' + onlineUser.username + '</label>' +
              '</div>'
            );
          }
        }

        $(".createGroupBtn").click(function(){
          let roomName = $("#createGroupModal .groupName").val();
          let roomParticipants = [];
          for(let friendInGroup of $(".createGroupModalContentGrid .listOfFriends#added .allFriends .friendInList")){
            roomParticipants.push($(friendInGroup).attr("data-id"));
          }

          console.log("ids (room) = " + roomParticipants);

          $.ajax({
            url: '/create/room',
            method: 'POST',
            data: {roomName, roomAdminId: loggedUser.id, participants: roomParticipants},
            success: function(data){
              let response = JSON.parse(data);
              if(response.status == "success"){
                let roomLayout = 
                '<div class="group" data-id="' + response.createdRoomId + '">' +
                  '<img class="friendImg" src="images/preview.jpeg" width="45px">' +
                  '<label class="friendName">' + response.roomName + '</label>' +
                '</div';

                $(".groups").append(roomLayout);
              }
            }
          });
      });

      }
    });
  });
});

// Groups
$('body').on("click", ".createGroupModalContentGrid .listOfFriends#all .allFriends > .friendInList", function(){
  $(".createGroupModalContentGrid .listOfFriends#all .allFriends").remove($(this));
  $(".createGroupModalContentGrid .listOfFriends#added .allFriends").append($(this));
});

$('body').on("click", ".createGroupModalContentGrid .listOfFriends#added .allFriends > .friendInList", function(){
  $(".createGroupModalContentGrid .listOfFriends#added .allFriends").remove($(this));
  $(".createGroupModalContentGrid .listOfFriends#all .allFriends").append($(this));
});


// Additional functions
function updateOnlineUsers(user, loggedUser){
  let onlineUsersWrapper = $(".contacts");
  let noOnlineUsersText = $("#default-li");
  onlineUsersWrapper.find(noOnlineUsersText).remove();

  console.log("user.id = " + user.id);
  console.log("loggedUser.id = " + loggedUser.id);
  if(user.id == loggedUser.id) return;

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

function checkIfUserAlreadyDisplayedToGroup(username){
  let onlineUsersElementsAll = $(".createGroupModalContentGrid .listOfFriends#all .allFriends > .friendInList");
  for(let onlineUserElement of onlineUsersElementsAll){
     if($(onlineUserElement).attr("data-username") == username) {
      return true;
     }
  }

  let onlineUsersElementsAdded = $(".createGroupModalContentGrid .listOfFriends#added .allFriends > .friendInList");
  for(let onlineUserElement of onlineUsersElementsAdded){
     if($(onlineUserElement).attr("data-username") == username) {
      return true;
     }
  }

  return false;
}