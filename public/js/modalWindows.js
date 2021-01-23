let addFriendBtn = document.querySelector(".contactsHeader");
let addFriendModal = document.querySelector(".addFriendModalWindow");
let modalCloseBtn = document.querySelectorAll(".modalCloseBtn");
let formInputFields = document.querySelectorAll(".addFriendModalContentGrid input");
let successFriendRequestAlert = document.getElementById("friendSuccessAlert");
let errorFriendRequestAlert = document.getElementById("friendErrorAlert");

let createGroupBtn = document.querySelector(".groupsHeader");
let createGroupModal = document.querySelectorAll(".addFriendModalWindow")[1];
let createGroupNameField = document.querySelector(".groupName");


// When the user clicks on the addFriendHeader, open the modal
addFriendBtn.onclick = function() {
    addFriendModal.style.display = "block";
}
  
// When the user clicks on (x)btn, close the modal
modalCloseBtn[0].onclick = function() {
    //closes modal
    addFriendModal.style.display = "none";
    //clears the input text fields
    formInputFields[0].value = "";
    formInputFields[1].value = "";
    //makes current alert invisible if animantion hasnt finished
    //TODO: DOESN'T WORK NEEDS FIXING
    successFriendRequestAlert.style.opacity = "0";
    errorFriendRequestAlert.style.opacity = "0";
}
modalCloseBtn[1].onclick = function() {
    //closes modal
    createGroupModal.style.display = "none";
    //clears the input text field (group name)
    createGroupNameField.value = "";
}
  
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == addFriendModal) {
        addFriendModal.style.display = "none";
        formInputFields[0].value = "";
        formInputFields[1].value = "";
        successFriendRequestAlert.style.opacity = "0";
        errorFriendRequestAlert.style.opacity = "0";
    } else if (event.target == createGroupModal) {  
        createGroupModal.style.display = "none";
        //clears the input text field (group name)
        createGroupNameField.value = "";
    }
}

jQuery (function() {
    $(".addFriendModalContentGrid").submit(function(e) {
        e.preventDefault();
        $.ajax({
            url: 'addFriend',
            method: 'POST',
            data: {formData: $(".addFriendModalContentGrid").serialize()},
            success: function(data) {
                if(data == 'success'){
                    //TODO: SEND FRIEND REQUEST UNLESS YOU ARE ALREADY FRIENDS WITH THE ENTERED USER
                    //SHOW WAIT AND THEN HIDE SUCCESS NOTOFICATION
                    addAndRemoveClass(successFriendRequestAlert, "showAndCloseAlert", 4000);
                    //clears the input text fields
                    formInputFields[0].value = "";
                    formInputFields[1].value = "";
                }else {
                    //SHOW WAIT AND THEN HIDE ERROR NOTOFICATION
                    addAndRemoveClass(errorFriendRequestAlert, "showAndCloseAlert", 4000);
                    //clears the input text fields
                    formInputFields[0].value = "";
                    formInputFields[1].value = "";
                }
            }
        });
    });
});

createGroupBtn.onclick = function() {
    createGroupModal.style.display = "block";
}

function addAndRemoveClass(element, clazz, time) {
    element.classList.add(clazz);
    setTimeout(() => {
        element.classList.remove(clazz);
    }, time);
}