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
  database.resetSockets();
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
        resolve(result[0]);
      });
    });
  },
  findById: function(collectionName, id, getColumns="*"){
    let columns = "";
    if(Array.isArray(getColumns)) columns = getColumns.join();
    else columns = getColumns;
    
    let sql = `select ${columns} from ${collectionName} where _id='${id}' limit 1`;
   
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
    let sql = `select * from ${usersTableName} where is_logged='1' and socket_id != 'NULL'`;
    
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
  }, 
  setSocketId: function(userId, socketId){
    let sql = `update users set socket_id='${socketId}' where _id='${userId}'`;

    return new Promise(function (resolve, reject) {
      db.query(sql, async function(err, result){
        if(err) reject(err);
        resolve();
      });
    });
  },
  resetSockets: function(){
    let sql = `update users set socket_id='NULL' where _id>0`;

    return new Promise(function (resolve, reject) {
      db.query(sql, async function(err, result){
        if(err) reject(err);
        resolve();
      });
    });
  },
  findAllUsersByIds: function(ids, getColumns="*"){
    let columns = "";
    if(Array.isArray(getColumns)) columns = getColumns.join();
    else columns = getColumns;

    let sql = `select ${columns} from ${usersTableName} where _id in (` + ids.join() + `)`;
   
    return new Promise((resolve, reject) => {
      db.query(sql, function(err, results){
        if(err) reject(err);
        resolve(results);
      });
    });
  }
}

exports.database = database;