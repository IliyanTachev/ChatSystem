const mysql = require('mysql');

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "rootpassword",
  database: "chat_system"
});

db.connect(function(err){
  if(err) throw err;
  console.log('Database connected...');
});

// Config
var usersTableName = 'users';

var database = {
  insertOne: function(collectionName, obj) {
    let sql = `insert into ${collectionName} set ?`;
    return new Promise((resolve, reject) => {
      db.query(sql, obj, function(err, result){
        if(err) reject(err);
        resolve(result.insertId);
      });
    });
  },
  findAll: function(collectionName){
    let sql = `select * from ${collectionName}`;
    return new Promise((resolve, reject) => {
      db.query(sql, function(err, results){
        if(err) reject(err);
        resolve(results);
      });
    });
  }, 
  findByEmailAndPassword: function(criteria){
    let sql = `select * from ${usersTableName} where email='${criteria.email}' and password='${criteria.password}' limit 1`;
   
    return new Promise((resolve, reject) => {
      db.query(sql, function(err, result){
        if(err) reject(err);
        console.log("res[0] = " + result[0]);
        resolve(result[0]);
      });
    });
  },
  findById: function(collectionName, id){
    let sql = `select * from ${collectionName} where _id='${id}' limit 1`;
   
    return new Promise((resolve, reject) => {
      db.query(sql, function(err, result){
        if(err) reject(err);
        resolve(result);
      });
    });
  },
  findByEmail: function(email){
    let sql = `select * from ${usersTableName} where email='${email}'`;
   
    return new Promise((resolve, reject) => {
      db.query(sql, function(err, result){
        if(err) reject(err);
        resolve(result);
      });
    });
  },
  findAllLoggedUsers: function(){
    let sql = `select * from ${usersTableName} where is_logged='1'`;
    
    let results = [];
    return new Promise((resolve, reject) => {
      db.query(sql, function(err, rows){
        if(err) reject(err);
        rows.forEach((row) => results.push(row));
        resolve(results); // returns objects
      });
    });
  }, 
  updateLoginStatus: function(id, state){
    let sql = `update users set is_logged='${state ? 1 : 0}' where _id='${id}'`;

    return new Promise((resolve, reject) => {
      db.query(sql, function(err, result){
        if(err) reject(err);
        resolve();
      });
    });
  }
}


exports.database = database;