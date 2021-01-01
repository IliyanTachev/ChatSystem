let createAccount = (formData, accounts) => {
    let[firstName, lastName, username, email, password] = formData;
    if(firstName.trim() == "" ||
        lastName.trim() == "" ||
        userName.trim() == "" ||
        password.trim() == "" ||
        password.length < 8 ||
       /\d/.test(firstName) ||
       /\d/.test(lastName) ||
       !isValidEmail(email)
      ) return {status: "error", message: "Invalid input. Please, try again."};

    for(const account of accountList){ // Check for duplicate Email
        if(account.email == email){
            return {status: "error", message: "Email already exists."};
        }
    }

    const account = new Account(firstName, lastName, userName, email, password);
    // clearInputFields(firstName, lastName, userName, email, password);
    accountList.push(account);
    return {status: "success"};
}

exports.createAccount = createAccount;