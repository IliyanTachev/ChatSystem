const isValidEmail = require('./common_functions.js').isValidEmail;
const Account = require('./entities/account.js');
const db = require('./database').database;

let createAccount = async (formData) => {
    let {firstName, lastName, username, email, password} = formData;

    let user = await db.findByEmail(email);
    if(user > 0) return {status: "error", message: "Email already exists."};

    if(firstName.trim() == "" ||
        lastName.trim() == "" ||
        username.trim() == "" ||
        password.trim() == "" ||
        password.length < 8 ||
       /\d/.test(firstName) ||
       /\d/.test(lastName) ||
       !isValidEmail(email)
      ) return {status: "error", message: "Invalid input. Please, try again."};

    const account = {
        'first_name': firstName,
        'last_name': lastName,
        username, email, password,
        'is_logged': 0
    }

    let insertId = await db.insertOne("users", account);
    account._id = insertId;
   
    return {status: "success", user: account};
}

exports.createAccount = createAccount;