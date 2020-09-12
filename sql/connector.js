var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'chess_academy_1'
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
