var mysql = require('mysql');
const config = require('../config');
var connection = mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    connectTimeout: config.db.connectionTimeout
});

function getUserID(email) {
    const sqlQuery = {
        sql: `select id from authentication where email = '${email}';`,
        timeout: config.db.queryTimeout
    };
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, function (error, results, fields) {
            if (error) {
                reject(error);
            } else if (results.length == 0) {
                resolve(0);
            } else {
                resolve(results[0].id);
            }
        })
    });
}

function createUserInDatabase(profile) {
    const sqlQuery1 = {
        sql: `insert into authentication(user_type, email, hashed_password, created_at) values('${profile.user_type}', '${profile.email}', '${profile.password}', now());`,
        timeout: config.db.queryTimeout
    };
    const sqlQuery2 = {
        sql: `select id from authentication where email = '${profile.email}';`,
        timeout: config.db.queryTimeout
    };
    return new Promise((resolve, reject) => {
        connection.beginTransaction({
            timeout: config.db.queryTimeout
        }, function (error) {
            if (error) {
                reject(error);
            }
            connection.query(sqlQuery1, function (error, results, fields) {
                if (error) {
                    connection.rollback({
                        timeout: config.db.queryTimeout
                    }, function () {
                        reject(error);
                    });
                }
                connection.query(sqlQuery2, function (error, results, fields) {
                    if (error) {
                        connection.rollback({
                            timeout: config.db.queryTimeout
                        }, function () {
                            reject(error);
                        });
                    } else {
                        profile.id = results[0].id;
                        const sqlQuery3 = {
                            sql: `insert into profile(
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
                                parent,
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
                                    STR_TO_DATE('${profile.dob}', '%Y-%m-%d'),
                                    '${profile.parent}',
                                    ${profile.is_private_contact},
                                    ${profile.is_private_alt_contact},
                                    ${profile.is_private_dob},
                                    ${profile.is_private_parent}
                                    );`,
                            timeout: config.db.queryTimeout
                        };
                        connection.query(sqlQuery3, function (error, results, fields) {
                            if (error) {
                                connection.rollback({
                                    timeout: config.db.queryTimeout
                                }, function () {
                                    reject(error);
                                });
                            }
                            connection.commit(function (error) {
                                if (error) {
                                    connection.rollback({
                                        timeout: config.db.queryTimeout
                                    }, function () {
                                        reject(error);
                                    });
                                } else {
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
        sql: `select hashed_password from authentication where email = '${email}';`,
        timeout: config.db.queryTimeout,
    };
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, function (error, results, fields) {
            if (error) {
                reject(error);
            } else if (results.length == 0) {
                resolve(0);
            } else {
                resolve(results[0].hashed_password);
            }
        })
    });
}

function getUserDetails(email) {
    const sqlQuery = {
        sql: `select id,user_type,email,created_at from authentication where email = '${email}';`,
        timeout: config.db.queryTimeout
    };
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, function (error, results, fields) {
            if (error) {
                reject(error);
            }
            if (results.length == 0) {
                resolve(0);
            } else {
                resolve({
                    user_details: {
                        id: results[0].id,
                        user_type: results[0].user_type,
                        email: results[0].email,
                        created_at: results[0].created_at
                    }
                });
            }
        })
    });
}

function getUserProfile(id) {
    const sqlQuery = {
        sql: `select
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
        from profile
        where auth_id = ${id};`,
        timeout: config.db.queryTimeout
    };
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, function (error, results, fields) {
            if (error) {
                reject(error);
            }
            if (results.length == 0) {
                resolve(0);
            } else {
                resolve({
                    user_profile: {
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
                    }
                });
            }
        })
    });
}

function updateUserProfile(userID, updated_user_profile) {
    const sqlQuery = {
        sql: `update profile
        set 
        fullname = '${updated_user_profile.fullname}',
        state = '${updated_user_profile.state}',
        description = '${updated_user_profile.description}',
        fide_id = '${updated_user_profile.fide_id}',
        lichess_id = '${updated_user_profile.lichess_id}',
        parent = '${updated_user_profile.parent}',
        user_image = '${updated_user_profile.photo_blob}',
        dob = STR_TO_DATE('${updated_user_profile.dob}', '%Y-%m-%d'),
        is_private_parent = ${updated_user_profile.is_private_parent},
        is_private_contact =${updated_user_profile.is_private_contact},
        is_private_alt_contact = ${updated_user_profile.is_private_alt_contact},
        is_private_dob = ${updated_user_profile.is_private_dob}
        where auth_id = ${userID};`,
        timeout: config.db.queryTimeout
    };
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, function (error, results, fields) {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

module.exports = {
    getUserID: getUserID,
    createUserInDatabase: createUserInDatabase,
    getUserDetails: getUserDetails,
    getPasswordHash: getPasswordHash,
    getUserProfile: getUserProfile,
    updateUserProfile: updateUserProfile
};