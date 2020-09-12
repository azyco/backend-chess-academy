var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'authentication'
});

function createUserInDatabase(email, password, type) {
    connection.connect();
    const sqlQuery = `insert into authentication(user_type, email,\
        hashed_password, created_at) values('${type}', '${email}', '${password}', now());\
        select id from authentication where email = ${email};`;
    connection.query(sqlQuery, function (error, results, fields) {
      if (error) throw error;
      console.log(results);
      console.log('The solution is: ', results[0].solution);
    });
    connection.end();
}

module.exports = {
    createUserInDatabase: createUserInDatabase
};
  