const isValidEmail = require('./common_functions.js').isValidEmail;
const Account = require('./entities/account.js');

let createAccount = (formData, accounts) => {
    console.log(formData);
    let {firstName, lastName, username, email, password} = formData;
    
    if(firstName.trim() == "" ||
        lastName.trim() == "" ||
        username.trim() == "" ||
        password.trim() == "" ||
        password.length < 8 ||
       /\d/.test(firstName) ||
       /\d/.test(lastName) ||
       !isValidEmail(email)
      ) return {status: "error", message: "Invalid input. Please, try again."};

    for(const account of accounts){ // Check for duplicate Email
        if(account.email == email){
            return {status: "error", message: "Email already exists."};
        }
    }

    const account = new Account(firstName, lastName, username, email, password);
    // clearInputFields(firstName, lastName, userName, email, password);
    accounts.push(account);
    return {status: "success"};
}

exports.createAccount = createAccount;