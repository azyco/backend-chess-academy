var mysql      = require('mysql');
const config   = require('../config');
var connection = mysql.createConnection({
  host     : config.db.host,
  port     : config.db.port,
  user     : config.db.user,
  password : config.db.password,
  database : config.db.database
});

function getUserID(email) {
    const sqlQuery = `select id from authentication where email = '${email}';`;
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, function (error, results, fields) {
            if(error || results.length == 0) {
                resolve(0);
            }
            else {
                resolve(results[0].id);
            }
        })
    });
}

function createUserInDatabase(email, password, type) {
    const sqlQuery = `insert into authentication(user_type, email,\
hashed_password, created_at) values('${type}', '${email}', '${password}', now());`;
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

module.exports = {
    getUserID: getUserID,
    createUserInDatabase: createUserInDatabase
};
