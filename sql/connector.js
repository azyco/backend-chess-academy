var mysql      = require('mysql');
const config   = require('../config');
var connection = mysql.createConnection({
  host              : config.db.host,
  port              : config.db.port,
  user              : config.db.user,
  password          : config.db.password,
  database          : config.db.database,
  connectTimeout    : config.db.timeout
});

function getUserID(email) {
    const sqlQuery ={
        sql:`select id from authentication where email = '${email}';`,
        timeout:5000
    };
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, function (error, results, fields) {
            if(error){
                reject(error);
            }
            else if(errresults.length == 0) {
                resolve(0);
            }
            else {
                resolve(results[0].id);
            }
        })
    });
}

function createUserInDatabase(email, password, type) {
    const sqlQuery = {
        sql:`insert into authentication(user_type, email, hashed_password, created_at) values('${type}', '${email}', '${password}', now());`,
        timeout:5000
    };
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, function (error, results, fields) {
            if(error) {
                reject(error);
            } else {
                resolve();
            }
        })
    });
}

function getPasswordHash(email) {
    const sqlQuery = {
        sql:`select hashed_password from authentication where email = '${email}';`,
        timeout:5000,
    };
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, function (error, results, fields) {
            if(error){
                reject(error);
            }
            else if(results.length == 0) {
                resolve(0);
            }
            else {
                resolve(results[0].hashed_password);
            }
        })
    });
}

function getUserDetails(email) {
    const sqlQuery = {
        sql:`select id,user_type,email,created_at from authentication where email = '${email}';`,
        timeout:5000
    };
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, function (error, results, fields) {
            if(error){
                reject(error);
            }
            if(results.length == 0) {
                resolve(0);
            }
            else {
                resolve({id: results[0].id, type: results[0].user_type, email: results[0].email, created_at: results[0].created_at});
            }
        })
    });
}

module.exports = {
    getUserID: getUserID,
    createUserInDatabase: createUserInDatabase,
    getUserDetails:getUserDetails,
    getPasswordHash:getPasswordHash
};
