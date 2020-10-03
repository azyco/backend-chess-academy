const mysql = require('mysql');
const config = require('../config');

const connection = mysql.createConnection({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  connectTimeout: config.db.connectionTimeout,
});

const utils = require('./utils');

const QUERY = require('./raw_sql.js');

function getUserID(email) {
  const sqlQuery = {
    sql: `select id from authentication where email = '${email}';`,
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else if (results.length === 0) {
        resolve(0);
      } else {
        resolve(results[0].id);
      }
    });
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
    timeout: config.db.queryTimeout,
  };
  const sqlQuery2 = {
    sql: `select id from authentication where email = '${profile.email}';`,
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.beginTransaction({
      timeout: config.db.queryTimeout,
    }, (transactionBeginError) => {
      if (transactionBeginError) {
        reject(transactionBeginError);
      }
      connection.query(sqlQuery1, (authInsertErr) => {
        if (authInsertErr) {
          connection.rollback({
            timeout: config.db.queryTimeout,
          }, () => {
            reject(authInsertErr);
          });
        }
        connection.query(sqlQuery2, (error, results) => {
          if (error) {
            connection.rollback({
              timeout: config.db.queryTimeout,
            }, () => {
              reject(error);
            });
          } else {
            // eslint-disable-next-line no-param-reassign
            profile.id = results[0].id;
            const sqlQuery3 = utils.sqlGenerateInsertToProfile(config, profile);
            connection.query(sqlQuery3, (insertProfileErr) => {
              if (insertProfileErr) {
                connection.rollback({
                  timeout: config.db.queryTimeout,
                }, () => {
                  reject(insertProfileErr);
                });
              }
              connection.commit((insertErr) => {
                if (insertErr) {
                  connection.rollback({
                    timeout: config.db.queryTimeout,
                  }, () => {
                    reject(insertErr);
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
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else if (results.length === 0) {
        resolve(0);
      } else {
        resolve(results[0].hashed_password);
      }
    });
  });
}

function getUserAuthentication(email) {
  const sqlQuery = {
    sql: `select id,user_type,email,created_at from authentication where email = '${email}';`,
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      }
      if (results.length === 0) {
        resolve(0);
      } else {
        resolve({
          user_authentication: {
            id: results[0].id,
            user_type: results[0].user_type,
            email: results[0].email,
            created_at: results[0].created_at,
          },
        });
      }
    });
  });
}

function getUserProfile(id) {
  const sqlQuery = utils.sqlGenerateGetProfile(config, id);
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      }
      if (results.length === 0) {
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
            is_private_parent: results[0].is_private_parent,
          },
        });
      }
    });
  });
}

function updateUserProfile(userID, updatedUserProfile) {
  const sqlQuery = {
    sql: `update profile
        set 
        fullname = '${updatedUserProfile.fullname}',
        state = '${updatedUserProfile.state}',
        description = '${updatedUserProfile.description}',
        fide_id = '${updatedUserProfile.fide_id}',
        lichess_id = '${updatedUserProfile.lichess_id}',
        parent = '${updatedUserProfile.parent}',
        user_image = '${updatedUserProfile.photo_blob}',
        dob = STR_TO_DATE('${updatedUserProfile.dob}', '%Y-%m-%d'),
        is_private_parent = ${updatedUserProfile.is_private_parent},
        is_private_contact =${updatedUserProfile.is_private_contact},
        is_private_alt_contact = ${updatedUserProfile.is_private_alt_contact},
        is_private_dob = ${updatedUserProfile.is_private_dob}
        where auth_id = ${userID};`,
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
// admin
function getClassrooms() {
  const sqlQuery = {
    sql: QUERY.SQL['GET.CLASSROOMS'],
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else if (results.length === 0) {
        resolve(0);
      } else {
        resolve(results);
      }
    });
  });
}

// admin
function addClassroom(classroomData) {
  const sqlQuery1 = {
    sql: `insert into classroom(
            name,
            description,
            is_active,
            created_at)
            values(
                '${classroomData.classroom_name}',
                '${classroomData.classroom_description}',
                ${classroomData.is_active},
                now());`,
    timeout: config.db.queryTimeout,
  };
  const sqlQuery2 = {
    sql: `select id from classroom where name = '${classroomData.classroom_name}';`,
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.beginTransaction({
      timeout: config.db.queryTimeout,
    }, (error) => {
      if (error) {
        reject(error);
      }
      connection.query(sqlQuery1, (insertErr) => {
        if (insertErr) {
          connection.rollback({
            timeout: config.db.queryTimeout,
          }, () => {
            reject(insertErr);
          });
        }
        connection.query(sqlQuery2, (selectErr, results) => {
          if (selectErr) {
            connection.rollback({
              timeout: config.db.queryTimeout,
            }, () => {
              reject(selectErr);
            });
          } else {
            const classroomId = results[0].id;
            const sqlQuery3 = {
              sql: utils.sqlGenerateInsertCoachesToClassRoom(classroomId,
                classroomData.coach_array_selected),
              timeout: config.db.queryTimeout,
            };
            connection.query(sqlQuery3, (insertCoachErr) => {
              if (insertCoachErr) {
                connection.rollback({
                  timeout: config.db.queryTimeout,
                }, () => {
                  reject(insertCoachErr);
                });
              }
              const sqlQuery4 = {
                sql: utils.sqlGenerateInsertStudentsToClassRoom(classroomId,
                  classroomData.student_array_selected),
                timeout: config.db.queryTimeout,
              };
              connection.query(sqlQuery4, (insertStudentsErr) => {
                if (insertStudentsErr) {
                  connection.rollback({
                    timeout: config.db.queryTimeout,
                  }, () => {
                    reject(insertStudentsErr);
                  });
                }
                connection.commit((commitErr) => {
                  if (commitErr) {
                    connection.rollback({
                      timeout: config.db.queryTimeout,
                    }, () => {
                      reject(commitErr);
                    });
                  } else {
                    resolve();
                  }
                });
              });
            });
          }
        });
      });
    });
  });
}

// admin
function getStudents() {
  const sqlQuery = {
    sql: QUERY.SQL['GET.STUDENTS'],
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else if (results.length === 0) {
        resolve(0);
      } else {
        resolve(results);
      }
    });
  });
}
// admin
function getCoaches() {
  const sqlQuery = {
    sql: `select authentication.id,authentication.email,authentication.user_type,profile.fullname 
        from authentication, profile
        where 
        (authentication.id = profile.auth_id) 
        and authentication.user_type = "coach";`,
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else if (results.length === 0) {
        resolve(0);
      } else {
        resolve(results);
      }
    });
  });
}

module.exports = {
  getUserID,
  createUserInDatabase,
  getUserAuthentication,
  getPasswordHash,
  getUserProfile,
  updateUserProfile,
  getClassrooms,
  addClassroom,
  getStudents,
  getCoaches,
};
