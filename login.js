const login = (accountToLogin, accounts) => {
    for(const acc of accounts){
        if(accountToLogin.email == acc.email && accountToLogin.password == acc.password){
            //log in user with their account
            return acc;
        }
    }
    return false;
}

exports.login = login;
