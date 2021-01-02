class Account{
    firstName;
    lastName;
    username;
    email;
    password;
    friendList;

    constructor(firstName, lastName, username, email, password) {
         this.firstName = firstName;
         this.lastName = lastName;
         this.username = username;
         this.email = email;
         this.password = password;
         this.friendList = [];
    }

    addFriend(friendAccount){
        this.friendList.push(friendAccount);
    }

    removeFriend(friendAccount){
        const indexToBeRomoved = this.friendList.indexOf(friendAccount);
        this.friendList.splice(indexToBeRomoved, 1);
    }

}

module.exports = Account;