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
    if (collectionName == "messages") sql += ", created_on=NOW()";

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
  findAllLoggedUsers: function(loggedUserId){
    let sql = `select * from ${usersTableName} where is_logged='1' and socket_id != 'NULL' and _id!='${loggedUserId}'`;
    
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
      db.query(sql, async function(err){
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
  },
  findUserByUsernameAndCode: function(username, code){
    let sql = `select _id from ${usersTableName} where code_id='${code}' and username='${username}' limit 1`;

    return new Promise((resolve, reject) => {
      db.query(sql, function(err, result){
        if(err) reject(err);
        result.length == 0 ? resolve(false) : resolve(true);
      })
    });
  },  
  findAllMessages: function(senderId, receiverId, options = {}){
    // Default Options
    if(!options.hasOwnProperty("mode")) options.mode = 'default';
    if(!options.hasOwnProperty("order")) options.order='ASC';

    // Join (`Users` and `Messages`)
    let sql = `select t2.username as 'senderUsername', t1.message, t1.created_on, t1.seen_by_receiver from messages t1 INNER JOIN users t2 ON t2._id=t1.sender_id ` +
              `where (t1.sender_id='${senderId}' and t1.receiver_id='${receiverId}') `;
            
    if(options.mode == "default") sql += `or (t1.sender_id='${receiverId}' and t1.receiver_id='${senderId}') `;
    sql += `ORDER BY t1.created_on ` + options.order;

    return new Promise((resolve, reject) => {
      db.query(sql, function(err, results){
        if(err) reject(err);
        resolve(results);
      });
    });
  }, 
  setSeenMessageStatus: function(senderId, receiverId){
    // let sql1 = `update messages set seen_by_receiver='0' where _id>=0`;
    // new Promise((resolve, reject) => {
    //   db.query(sql1, function(err, result){
    //     if(err) reject(err);
    //     resolve();
    //   });
    // }).then(()=>{
      let sql2 = `update messages set seen_by_receiver='1' where created_on = ` +
                `(SELECT latest from (SELECT MAX(created_on) as 'latest' FROM messages msgs where msgs.sender_id='${senderId}' and msgs.receiver_id='${receiverId}') as t)` +
                ` and sender_id='${senderId}' and receiver_id='${receiverId}'`;

      return new Promise((resolve, reject) => {
          db.query(sql2, function(err, result){
            if(err) reject(err);
            resolve();
          });
      });
    // });
  }
}

exports.database = database;