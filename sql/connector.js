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
            else if(results.length == 0) {
                resolve(0);
            }
            else {
                resolve(results[0].id);
            }
        })
    });
}

function createUserInDatabase(profile) {
    const sqlQuery1 = {
        sql:`insert into authentication(user_type, email, hashed_password, created_at) values('${profile.type}', '${profile.email}', '${profile.password}', now());`,
        timeout:5000
    };
    const sqlQuery2 ={
        sql:`select id from authentication where email = '${profile.email}';`,
        timeout:5000
    };
    return new Promise((resolve, reject) => {
        connection.beginTransaction(function(error) {
            if (error) {
                reject(error);
            }
            connection.query(sqlQuery1, function(error, results, fields) {
                if (error) { 
                    connection.rollback(function() {
                        reject(error);
                    });
                }
                connection.query(sqlQuery2, function (error, results, fields) {
                    if(error){
                        connection.rollback(function() {
                            reject(error);
                        });
                    }
                    else {
                        profile.id = results[0].id;
                        const sqlQuery3 = {
                            sql:`insert into profile(
                                auth_id,
                                fullname,
                                country,
                                state,
                                description,
                                user_image,
                                fide_id,
                                contact,
                                alt_contact,
                                contact_code,
                                alt_contact_code,
                                lichess_id,
                                dob,
                                parent_name,
                                is_private_contact,
                                is_private_alt_contact,
                                is_private_dob,
                                is_private_parent
                                ) 
                                values(
                                    ${profile.id},
                                    '${profile.fullname}',
                                    '${profile.country}',
                                    '${profile.state}',
                                    '${profile.description}',
                                    '${profile.user_image}',
                                    '${profile.fide_id}',
                                    ${profile.contact},
                                    ${profile.alt_contact},
                                    ${profile.contact_code},
                                    ${profile.alt_contact_code},
                                    '${profile.lichess_id}',
                                    '${profile.dob}',
                                    '${profile.parent}',
                                    ${profile.is_private_contact},
                                    ${profile.is_private_alt_contact},
                                    ${profile.is_private_dob},
                                    ${profile.is_private_parent}
                                    );`,
                            timeout:5000
                        };
                        connection.query(sqlQuery3, function(error, results, fields) {
                            if (error) { 
                                connection.rollback(function() {
                                    reject(error);
                                });
                            }  
                            connection.commit(function(error) {
                                if (error) { 
                                    connection.rollback(function() {
                                        reject(error);
                                    });
                                }
                                else{
                                    resolve();
                                }
                            });
                        });
                    }
                });
                
            });
        });
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

function getUserProfile(id) {
    const sqlQuery = {
        sql:`select 
        fullname,
        country,
        state,
        description,
        user_image,
        fide_id,
        contact,
        alt_contact,
        contact_code,
        alt_contact_code,
        lichess_id,
        dob,
        parent,
        is_private_contact,
        is_private_alt_contact,
        is_private_dob,
        is_private_parent 
        where auth_id = '${id}';`,
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
                resolve({
                    fullname: results[0].fullname,
                    country: results[0].country,
                    state: results[0].state,
                    description: results[0].description,
                    user_image: results[0].user_image,
                    fide_id: results[0].fide_id,
                    lichess_id: results[0].lichess_id,
                    contact: results[0].contact,
                    contact_code: results[0].contact_code,
                    alt_contact: results[0].alt_contact,
                    alt_contact_code: results[0].alt_contact_code,
                    dob: results[0].dob,
                    parent: results[0].parent,
                    is_private_contact: results[0].is_private_contact,
                    is_private_alt_contact: results[0].is_private_alt_contact,
                    is_private_dob: results[0].is_private_dob,
                    is_private_parent: results[0].is_private_parent
                });
            }
        })
    });
}

module.exports = {
    getUserID: getUserID,
    createUserInDatabase: createUserInDatabase,
    getUserDetails:getUserDetails,
    getPasswordHash:getPasswordHash,
    getUserProfile:getUserProfile
};
