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

function getClassroomMappings(classroom_id) {
  const sqlQuery1 = {
    sql:`
      select
        classroom.id,
        GROUP_CONCAT(mc.coach_id) as coaches,
        cinfo.students
      from
        classroom
        LEFT JOIN mapping_coach_classroom as mc ON classroom.id = mc.classroom_id,
        (
          select
            ms.classroom_id as cid,
            GROUP_CONCAT(ms.student_id) as students
          from
            mapping_student_classroom as ms
          where
            ms.classroom_id = ${classroom_id}
        ) as cinfo
      where
        classroom.id = ${classroom_id}
        AND cinfo.cid = id
      ;`,
    timeout: config.db.queryTimeout,
  };

  return new Promise((resolve, reject) => {
    connection.query(sqlQuery1, (error, results, fields) => {
      if (error) {
        reject(error);
      }
      else{
        resolve(results[0]);
      }
    });
  });
}

// admin
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
    timeout: config.db.queryTimeout,
  };
  const sqlQuery2 = {
    sql: `select id from classroom where name = '${classroom_data.classroom_name}';`,
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
            const classroom_id = results[0].id;
            const sqlQuery3 = {
              sql: utils.sqlGenerateInsertCoachesToClassRoom(classroom_id,
                classroom_data.coach_array_selected),
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
                sql: utils.sqlGenerateInsertStudentsToClassRoom(classroom_id,
                  classroom_data.student_array_selected),
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

function editClassroom(classroom_data) {
  console.log(classroom_data);
  const sql_edit_classroom = {
    sql: `update classroom
        set
        name = '${classroom_data.classroom_name}',
        description = '${classroom_data.classroom_description}'
        where
        id = ${classroom_data.classroom_id};`,
    timeout: config.db.queryTimeout,
  };

  const sql_delete_student_mapping = {
    sql: `delete
        from
        mapping_student_classroom
        where
        classroom_id = ${classroom_data.classroom_id}
        ;`,
    timeout: config.db.queryTimeout,
  };

  const sql_delete_coach_mapping = {
    sql: `delete
        from
        mapping_coach_classroom
        where
        classroom_id = ${classroom_data.classroom_id}
        ;`,
    timeout: config.db.queryTimeout,
  };

  const sql_add_student_mapping = {
    sql: utils.sqlGenerateInsertStudentsToClassRoom(classroom_data.classroom_id,
      classroom_data.student_array_selected),
    timeout: config.db.queryTimeout,
  };

  const sql_add_coach_mapping = {
    sql: utils.sqlGenerateInsertCoachesToClassRoom(classroom_data.classroom_id,
      classroom_data.coach_array_selected),
    timeout: config.db.queryTimeout,
  };

  let updates = classroom_data.classroom_id + ',';



  return new Promise((resolve, reject) => {
    connection.beginTransaction({
      timeout: config.db.queryTimeout,
    }, (error) => {
      if (error) {
        reject(error);
      }
      else{
        connection.query(sql_edit_classroom, (insertErr) => {
          if (insertErr) {
            connection.rollback({
              timeout: config.db.queryTimeout,
            }, () => {
              reject(insertErr);
            });
          }
          else{
            updates = updates.concat("classroom details updated,");
            connection.query(sql_delete_coach_mapping, (insertErr) => {
              if (insertErr) {
                connection.rollback({
                  timeout: config.db.queryTimeout,
                }, () => {
                  reject(insertErr);
                });
              }
              updates = updates.concat("deleted coach mapping,");
              connection.query(sql_add_coach_mapping, (insertErr) => {
                if (insertErr) {
                  connection.rollback({
                    timeout: config.db.queryTimeout,
                  }, () => {
                    reject(insertErr);
                  });
                }
                else{
                  updates = updates.concat("updated coach mapping,");
                  connection.query(sql_delete_coach_mapping, (insertErr) => {
                    if (insertErr) {
                      connection.rollback({
                        timeout: config.db.queryTimeout,
                      }, () => {
                        reject(insertErr);
                      });
                    }
                    updates = updates.concat("deleted coach mapping,");
                    connection.query(sql_add_coach_mapping, (insertErr) => {
                      if (insertErr) {
                        connection.rollback({
                          timeout: config.db.queryTimeout,
                        }, () => {
                          reject(insertErr);
                        });
                      }
                      else{
                        updates = updates.concat("updated coach mapping,");
                        connection.query(sql_delete_student_mapping, (insertErr) => {
                          if (insertErr) {
                            connection.rollback({
                              timeout: config.db.queryTimeout,
                            }, () => {
                              reject(insertErr);
                            });
                          }
                          updates = updates.concat("deleted student mapping,");
                          connection.query(sql_add_student_mapping, (insertErr) => {
                            if (insertErr) {
                              connection.rollback({
                                timeout: config.db.queryTimeout,
                              }, () => {
                                reject(insertErr);
                              });
                            }
                            else{
                              updates = updates.concat("updated student mapping,");
                              connection.commit((commitErr) => {
                                if (commitErr) {
                                  connection.rollback({
                                    timeout: config.db.queryTimeout,
                                  }, () => {
                                    reject(commitErr);
                                  });
                                } else {
                                  updates = updates.concat("commited");
                                  resolve(updates);
                                }
                              });
                            }
                          });
                        });
                      }
                    });
                  });
                }
              });
            });
          }
        });
      }
    });
  });
}
  // return new Promise((resolve, reject) => {
  //   connection.beginTransaction({
  //     timeout: config.db.queryTimeout,
  //   }, (error) => {
  //     if (error) {
  //       reject(error);
  //       return;
  //     }

  //     if(classroom_data.classroom_details_is_dirty){
  //       connection.query(sql_edit_classroom, (insertErr) => {
  //         if (insertErr) {
  //           connection.rollback({
  //             timeout: config.db.queryTimeout,
  //           }, () => {
  //             reject(insertErr);
  //             return;
  //           });
  //         }
  //         updates = updates.concat("classroom details updated,");
  //         console.log("classroom details updated,");
  //       });
  //     }

  //     if(classroom_data.coach_array_selected_is_dirty){
  //       connection.query(sql_delete_coach_mapping, (insertErr) => {
  //         if (insertErr) {
  //           connection.rollback({
  //             timeout: config.db.queryTimeout,
  //           }, () => {
  //             reject(insertErr);
  //             return;
  //           });
  //         }
  //         updates = updates.concat("deleted coach mapping,");
  //         console.log("deleted coach mapping,");
  //         connection.query(sql_add_coach_mapping, (insertErr) => {
  //           if (insertErr) {
  //             connection.rollback({
  //               timeout: config.db.queryTimeout,
  //             }, () => {
  //               reject(insertErr);
  //               return;
  //             });
  //           }
  //           updates = updates.concat("updated coach mapping,");
  //           console.log("updated coach mapping,");
  //         });
  //       });
  //     }

  //     if(classroom_data.student_array_selected_is_dirty){
  //       connection.query(sql_delete_student_mapping, (insertErr) => {
  //         if (insertErr) {
  //           connection.rollback({
  //             timeout: config.db.queryTimeout,
  //           }, () => {
  //             reject(insertErr);
  //             return;
  //           });
  //         }
  //         updates = updates.concat("deleted student mapping,");
  //         console.log("deleted student mapping,");
  //         connection.query(sql_add_student_mapping, (insertErr) => {
  //           if (insertErr) {
  //             connection.rollback({
  //               timeout: config.db.queryTimeout,
  //             }, () => {
  //               reject(insertErr);
  //               return;
  //             });
  //           }
  //           updates = updates.concat("updated student mapping,");
  //           console.log("updated student mapping,");
  //         });
  //       });
  //     }
      
  //     connection.commit((commitErr) => {
  //       if (commitErr) {
  //         connection.rollback({
  //           timeout: config.db.queryTimeout,
  //         }, () => {
  //           reject(commitErr);
  //           return;
  //         });
  //       } else {
  //         console.log('commited');
  //         updates = updates.concat("commited");
  //         resolve(updates);
  //         return;
  //       }
  //     });
  //   });
  // });

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
  getClassroomMappings,
  addClassroom,
  getStudents,
  getCoaches,
  editClassroom
};
