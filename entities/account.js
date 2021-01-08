class Account{
    firstName;
    lastName;
    username;
    email;
    password;
    friends;
    isLogged;
    sockedId;

    constructor(firstName, lastName, username, email, password) {
         this.firstName = firstName;
         this.lastName = lastName;
         this.username = username;
         this.email = email;
         this.password = password;
         this.friends = [];
         this.isLogged = false;
         this.sockedId = null;
    }

    addFriend(friendAccount){
        this.friends.push(friendAccount);
    }

    removeFriend(friendAccount){
        const indexToBeRomoved = this.friends.indexOf(friendAccount);
        this.friends.splice(indexToBeRomoved, 1);
    }
}

module.exports = Account;