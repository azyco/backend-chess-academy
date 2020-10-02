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
        sql: `insert into authentication(
            user_type, email,
            hashed_password,
            created_at
            )
            values(
                '${profile.user_type}',
                '${profile.email}',
                '${profile.password}',
                now());`,
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
                                    '${profile.contact}',
                                    '${profile.alt_contact}',
                                    '${profile.contact_code}',
                                    '${profile.alt_contact_code}',
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

function getUserAuthentication(email) {
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
                    user_authentication: {
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
//admin
function getClassrooms() {
    const sqlQuery = {
        sql: 
        `select
        classroom.id,
        classroom.name,
        classroom.description,
        classroom.is_active,
        classroom.created_at,
        count(ms.student_id) as student_count,
        group_concat(p.fullname) as coaches
        from
        classroom,
        mapping_student_classroom as ms,
        mapping_coach_classroom as mc,
        profile as p
        where
        classroom.id = ms.classroom_id AND
        classroom.id = mc.classroom_id AND
        mc.coach_id = p.auth_id
        group by
        mc.coach_id
        ;`,
        timeout: config.db.queryTimeout
    };
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, function (error, results, fields) {
            if (error) {
                reject(error);
            } else if (results.length == 0) {
                resolve(0);
            } else {
                resolve(results);
            }
        })
    });
}

//admin
function addClassroom(classroom_data) {
    const sqlQuery1 = {
        sql: `insert into classroom(
            name,
            description,
            is_active,
            created_at)
            values(
                '${classroom_data.classroom_name}',
                '${classroom_data.classroom_description}',
                ${classroom_data.is_active},
                now());`,
        timeout: config.db.queryTimeout
    };
    const sqlQuery2 = {
        sql: `select id from classroom where name = '${classroom_data.classroom_name}';`,
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
                        const classroom_id = results[0].id;
                        let sql =
                            `insert into mapping_coach_classroom(
                            coach_id,
                            classroom_id,
                            created_at)
                            values`;
                        classroom_data.coach_array_selected.forEach((value) => {
                            sql = sql.concat(
                                `(
                                    ${value.id},
                                    ${classroom_id},
                                    now()),`)
                        });
                        sql = sql.slice(0, sql.length - 1).concat(';');
                        const sqlQuery3 = {
                            sql: sql,
                            timeout: config.db.queryTimeout
                        }
                        connection.query(sqlQuery3, function (error, results, fields) {
                            if (error) {
                                connection.rollback({
                                    timeout: config.db.queryTimeout
                                }, function () {
                                    reject(error);
                                });
                            }
                            let sql =
                                `insert into mapping_student_classroom(
                                student_id,
                                classroom_id,
                                created_at)
                                values`;
                            classroom_data.student_array_selected.forEach((value) => {
                                sql = sql.concat(
                                    `(
                                        ${value.id},
                                        ${classroom_id},
                                        now()),`
                                )
                            });
                            sql = sql.slice(0, sql.length - 1).concat(';');
                            const sqlQuery4 = {
                                sql: sql,
                                timeout: config.db.queryTimeout
                            }
                            connection.query(sqlQuery4, function (error, results, fields) {
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
                            })
                        });
                    }
                });

            });
        });
    });
}

//admin
function getStudents() {
    const sqlQuery = {
        sql: `select authentication.id,authentication.email,authentication.user_type,profile.fullname 
        from authentication, profile
        where 
        (authentication.id = profile.auth_id) 
        and authentication.user_type = "student";`,
        timeout: config.db.queryTimeout
    };
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, function (error, results, fields) {
            if (error) {
                reject(error);
            } else if (results.length == 0) {
                resolve(0);
            } else {
                resolve(results);
            }
        })
    });
}
//admin
function getCoaches() {
    const sqlQuery = {
        sql: `select authentication.id,authentication.email,authentication.user_type,profile.fullname 
        from authentication, profile
        where 
        (authentication.id = profile.auth_id) 
        and authentication.user_type = "coach";`,
        timeout: config.db.queryTimeout
    };
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, function (error, results, fields) {
            if (error) {
                reject(error);
            } else if (results.length == 0) {
                resolve(0);
            } else {
                resolve(results);
            }
        })
    });
}

module.exports = {
    getUserID: getUserID,
    createUserInDatabase: createUserInDatabase,
    getUserAuthentication: getUserAuthentication,
    getPasswordHash: getPasswordHash,
    getUserProfile: getUserProfile,
    updateUserProfile: updateUserProfile,
    getClassrooms: getClassrooms,
    addClassroom: addClassroom,
    getStudents: getStudents,
    getCoaches: getCoaches
};