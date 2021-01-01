class Account{
    firstName;
    lastName;
    userName;
    email;
    password;
    friendList;

    constructor(firstName, lastName, userName, email, password) {
         this.firstName = firstName;
         this.lastName = lastName;
         this.userName = userName;
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