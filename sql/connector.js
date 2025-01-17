/* eslint-disable camelcase */
/* eslint-disable no-tabs */
const mysql = require('mysql');
const crypto = require('crypto');
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
    sql: `insert into authentication(user_type, email,hashed_password,created_at) 
      values(
        '${profile.user_type}',
        '${profile.email}',
        '${profile.password}',
        unix_timestamp(now())*1000);`,
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
              if (profile.user_type === 'coach') {
                const sqlQuery4 = utils.sqlGenerateInsertToCoachExtras(config, profile);
                connection.query(sqlQuery4, (insertCoachExtrasErr) => {
                  if (insertProfileErr) {
                    connection.rollback({
                      timeout: config.db.queryTimeout,
                    }, () => {
                      reject(insertCoachExtrasErr);
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
              } else {
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
              }
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
    sql: `select id,
		user_type,
		email,
		created_at
		from
		authentication
		where
		email = '${email}'
		;`,
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
            city: results[0].city,
            address: results[0].address,
            pincode: results[0].pincode,
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
        city = '${updated_user_profile.city}',
        address = '${updated_user_profile.address}',
        pincode = '${updated_user_profile.pincode}',
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

function getCoachExtras(id) {
  const sqlQuery = utils.sqlGenerateGetCoachExtras(config, id);
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      }
      if (results.length === 0) {
        resolve(0);
      } else {
        resolve({
          coach_extras: {
            coach_id: results[0].coach_id,
            fide_title: results[0].fide_title,
            peak_rating: results[0].peak_rating,
            current_rating: results[0].current_rating,
            perf_highlights: results[0].perf_highlights,
            exp_trainer: results[0].exp_trainer,
            successful_students: results[0].successful_students,
            fees: results[0].fees,
            bank_details: results[0].bank_details,
          },
        });
      }
    });
  });
}

function updateCoachExtras(userID, updated_coach_extras) {
  const sqlQuery = {
    sql:
      `update
        coach_extras
        set 
        fide_title = '${updated_coach_extras.fide_title}',
        peak_rating = '${updated_coach_extras.peak_rating}',
        current_rating = '${updated_coach_extras.current_rating}',
        perf_highlights = '${updated_coach_extras.perf_highlights}',
        exp_trainer = '${updated_coach_extras.exp_trainer}',
        successful_students = '${updated_coach_extras.successful_students}',
        fees = '${updated_coach_extras.fees}',
        bank_details = '${updated_coach_extras.bank_details}'
        where
        coach_id = ${userID};`,
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
      } else {
        resolve(results);
      }
    });
  });
}

function getClassroomMappings(classroom_id) {
  const sqlQuery1 = {
    sql: `
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
    connection.query(sqlQuery1, (error, results) => {
      if (error) {
        reject(error);
      } else {
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
								unix_timestamp(now())*1000);`,
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

  let updates = `id: ${classroom_data.classroom_id},`;

  return new Promise((resolve, reject) => {
    try {
      connection.beginTransaction({
        timeout: config.db.queryTimeout,
      }, (error) => {
        if (error) {
          reject(error);
        }

        if (classroom_data.classroom_details_is_dirty) {
          connection.query(sql_edit_classroom, (insertErr) => {
            if (insertErr) {
              connection.rollback({
                timeout: config.db.queryTimeout,
              }, () => {
                reject(insertErr);
              });
            }
            updates = updates.concat('classroom details updated,');
          });
        }

        if (classroom_data.coach_array_selected_is_dirty) {
          connection.query(sql_delete_coach_mapping, (deleteErr) => {
            if (deleteErr) {
              connection.rollback({
                timeout: config.db.queryTimeout,
              }, () => {
                reject(deleteErr);
              });
            }
            updates = updates.concat('deleted coach mapping,');
            connection.query(sql_add_coach_mapping, (insertErr) => {
              if (insertErr) {
                connection.rollback({
                  timeout: config.db.queryTimeout,
                }, () => {
                  reject(insertErr);
                });
              }
              updates = updates.concat('updated coach mapping,');
            });
          });
        }
      });

      if (classroom_data.student_array_selected_is_dirty) {
        connection.query(sql_delete_student_mapping, (insertErr) => {
          if (insertErr) {
            connection.rollback({
              timeout: config.db.queryTimeout,
            }, () => {
              reject(insertErr);
            });
          }
          updates = updates.concat('deleted student mapping,');
          connection.query(sql_add_student_mapping, (deleteErr) => {
            if (deleteErr) {
              connection.rollback({
                timeout: config.db.queryTimeout,
              }, () => {
                reject(deleteErr);
              });
            }
            updates = updates.concat('updated student mapping,');
          });
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
          updates = updates.concat('commited');
          resolve(updates);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

// admin
function getStudentsAdmin() {
  const sqlQuery = {
    sql: QUERY.SQL['GET.STUDENTS_ADMIN'],
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

function getStudentsCoach(filters) {
  const sqlQuery = {
    sql: `select
    authentication.id as student_id,
    profile.fullname
  from
    mapping_student_classroom,
    authentication,
    profile
  where
    authentication.id = mapping_student_classroom.student_id and
    mapping_student_classroom.student_id = profile.auth_id and
    ${(filters.classroom_id) ? `classroom_id in (${filters.classroom_id}) and` : ''}
    mapping_student_classroom.classroom_id in (
      select
        classroom_id
      from
        mapping_coach_classroom
      where
        coach_id = ${filters.coach_id}
    )
  group by
    mapping_student_classroom.student_id
    ;`,
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}
// admin
function getCoaches() {
  const sqlQuery = {
    sql: QUERY.SQL['GET.COACHES'],
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

function getUsers() {
  const sqlQuery = {
    sql: QUERY.SQL['GET.USERS'],
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

function getClassroomsStudent(student_id) {
  const sqlQuery = {
    sql: `select
		classroom.id,
		classroom.name,
		classroom.description,
		group_concat(profile.fullname) as coaches
		from
		classroom,
		mapping_student_classroom,
		mapping_coach_classroom,
		profile
		where
		mapping_student_classroom.student_id = ${student_id} and
		classroom.id = mapping_student_classroom.classroom_id and
		mapping_coach_classroom.classroom_id = classroom.id and
		mapping_coach_classroom.coach_id = profile.auth_id
		group by
		classroom.id`,
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

function getClassroomsCoach(coach_id) {
  const sqlQuery = {
    sql: `select
		classroom.id,
		classroom.name,
		classroom.description,
		count(profile.fullname) as student_count
		from
		classroom,
		mapping_student_classroom,
		mapping_coach_classroom,
		profile
		where
		mapping_coach_classroom.coach_id = ${coach_id} and
		classroom.id = mapping_coach_classroom.classroom_id and
		mapping_student_classroom.classroom_id = classroom.id and
		mapping_student_classroom.student_id = profile.auth_id
		group by
		classroom.id`,
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

function addClass(class_details) {
  const class_hash = crypto.createHash('md5').update(new Date().toISOString()).digest('hex');
  const sqlQuery = {
    sql: `insert into class(
			classroom_id,
			start_time,
			duration,
			created_at,
			class_hash
		  )
		  values(
			${class_details.classroom_id},
			${class_details.start_time},
			${class_details.duration},
			unix_timestamp(now())*1000,
			'${class_hash}'
		  );`,
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

function getClass(classroom_id) {
  const sqlQuery = {
    sql: `select 
		id,
		classroom_id,
		start_time,
		duration,
		created_at,
		class_hash
		from
		class
		where
		classroom_id = ${classroom_id}
		;`,
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

function deleteClass(class_id) {
  const sqlQuery = {
    sql: `delete
		from class
		where
		id = ${class_id};`,
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

function checkClassroomAccessPrivilegeCoach(coach_id, classroom_id) {
  const sqlQuery = {
    sql: `select
		classroom_id,
		coach_id
		from
		mapping_coach_classroom
		where
		coach_id = ${coach_id} and
		classroom_id = ${classroom_id}
		;`,
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else if (results.length === 0) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

function checkClassroomAccessPrivilegeStudent(student_id, classroom_id) {
  const sqlQuery = {
    sql: `select
		classroom_id,
		student_id
		from
		mapping_student_classroom
		where
		student_id = ${student_id} and
		classroom_id = ${classroom_id}
		;`,
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else if (results.length === 0) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

function enterClassStudent(student_id, class_hash) {
  const sqlQuery = {
    sql: `select
		class.id as class_id,
		class.start_time,
		class.duration,
		class.created_at class_created_at,
		class.start_time_actual,
		class.end_time_actual,
		classroom.id as classroom_id,
		classroom.name,
		classroom.description,
		classroom.is_active,
		classroom.created_at as classroom_created_at
		from
		class,
		classroom,
		mapping_student_classroom,
		authentication
		where
		class.class_hash = '${class_hash}' and
		authentication.id = ${student_id} and
		authentication.id = mapping_student_classroom.student_id and
		classroom.id = class.classroom_id and
		mapping_student_classroom.classroom_id = class.classroom_id
		;`,
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0]);
      }
    });
  });
}

function enterClassCoach(coach_id, class_hash) {
  const sqlQuery = {
    sql: `select
		class.id as class_id,
		class.start_time,
		class.duration,
		class.created_at class_created_at,
		class.start_time_actual,
		class.end_time_actual,
		classroom.id as classroom_id,
		classroom.name,
		classroom.description,
		classroom.is_active,
		classroom.created_at as classroom_created_at
		from
		class,
		classroom,
		mapping_coach_classroom,
		authentication
		where
		class.class_hash = '${class_hash}' and
		authentication.id = ${coach_id} and
		authentication.id = mapping_coach_classroom.coach_id and
		classroom.id = class.classroom_id and
		mapping_coach_classroom.classroom_id = class.classroom_id
		;`,
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0]);
      }
    });
  });
}

function enterClassAdmin(class_hash) {
  const sqlQuery = {
    sql: `select
		class.id as class_id,
		class.start_time,
		class.duration,
		class.created_at class_created_at,
		class.start_time_actual,
		class.end_time_actual,
		classroom.id as classroom_id,
		classroom.name,
		classroom.description,
		classroom.is_active,
		classroom.created_at as classroom_created_at
		from
		class,
		classroom
		where
		class.class_hash = '${class_hash}' and
		classroom.id = class.classroom_id
		;`,
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0]);
      }
    });
  });
}

function startClass(class_hash, coach_id) {
  const sqlQuery1 = {
    sql: `select
		class.class_hash
		from
		class,
		classroom,
		mapping_coach_classroom,
		authentication
		where
		class.class_hash = '${class_hash}' and
		authentication.id = ${coach_id} and
		authentication.id = mapping_coach_classroom.coach_id and
		classroom.id = class.classroom_id and
		mapping_coach_classroom.classroom_id = class.classroom_id
		;`,
    timeout: config.db.queryTimeout,
  };

  const sqlQuery2 = {
    sql: `update class
		set
		start_time_actual = unix_timestamp(now())*1000
		where
		class_hash = '${class_hash}'
		;`,
    timeout: config.db.queryTimeout,
  };

  return new Promise((resolve, reject) => {
    connection.beginTransaction({
      timeout: config.db.queryTimeout,
    }, (error) => {
      if (error) {
        reject(error);
      }
      connection.query(sqlQuery1, (selectErr, results) => {
        if (selectErr) {
          connection.rollback({
            timeout: config.db.queryTimeout,
          }, () => {
            reject(selectErr);
          });
        }
        if (results.length === 0) {
          reject({ error: 'invalid_user_id' });
        }
        connection.query(sqlQuery2, (updateErr) => {
          if (updateErr) {
            connection.rollback({
              timeout: config.db.queryTimeout,
            }, () => {
              reject(updateErr);
            });
          }
          connection.commit((commitErr) => {
            if (commitErr) {
              connection.rollback({
                timeout: config.db.queryTimeout,
              }, () => {
                reject(commitErr);
              });
            }
            resolve();
          });
        });
      });
    });
  });
}

function endClass(class_hash, coach_id) {
  const sqlQuery1 = {
    sql: `select
		class.class_hash
		from
		class,
		classroom,
		mapping_coach_classroom,
		authentication
		where
		class.class_hash = '${class_hash}' and
		authentication.id = ${coach_id} and
		authentication.id = mapping_coach_classroom.coach_id and
		classroom.id = class.classroom_id and
		mapping_coach_classroom.classroom_id = class.classroom_id
		;`,
    timeout: config.db.queryTimeout,
  };

  const sqlQuery2 = {
    sql: `update class
		set
		end_time_actual = unix_timestamp(now())*1000
		where
		class_hash = '${class_hash}'
		;`,
    timeout: config.db.queryTimeout,
  };

  return new Promise((resolve, reject) => {
    connection.beginTransaction({
      timeout: config.db.queryTimeout,
    }, (error) => {
      if (error) {
        reject(error);
      }
      connection.query(sqlQuery1, (selectErr, results) => {
        if (selectErr) {
          connection.rollback({
            timeout: config.db.queryTimeout,
          }, () => {
            reject(selectErr);
          });
        }
        if (results.length === 0) {
          reject({ error: 'invalid_user_id' });
        }
        connection.query(sqlQuery2, (updateErr) => {
          if (updateErr) {
            connection.rollback({
              timeout: config.db.queryTimeout,
            }, () => {
              reject(updateErr);
            });
          }
          connection.commit((commitErr) => {
            if (commitErr) {
              connection.rollback({
                timeout: config.db.queryTimeout,
              }, () => {
                reject(commitErr);
              });
            }
            resolve();
          });
        });
      });
    });
  });
}

function checkClassAccessPrivilegeStudent(student_id, class_id) {
  const sqlQuery = {
    sql: `select
		class.id as class_id,
		class.start_time,
		class.duration,
		class.created_at class_created_at,
		class.start_time_actual,
		class.end_time_actual,
		classroom.id as classroom_id,
		classroom.name,
		classroom.description,
		classroom.is_active,
		classroom.created_at as classroom_created_at
		from
		class,
		classroom,
		mapping_student_classroom,
		authentication
		where
		class.id = '${class_id}' and
		authentication.id = ${student_id} and
		authentication.id = mapping_student_classroom.student_id and
		classroom.id = class.classroom_id and
		mapping_student_classroom.classroom_id = class.classroom_id
		;`,
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0]);
      }
    });
  });
}

function checkClassAccessPrivilegeCoach(coach_id, class_id) {
  const sqlQuery = {
    sql: `select
		class.id as class_id,
		class.start_time,
		class.duration,
		class.created_at class_created_at,
		class.start_time_actual,
		class.end_time_actual,
		classroom.id as classroom_id,
		classroom.name,
		classroom.description,
		classroom.is_active,
		classroom.created_at as classroom_created_at
		from
		class,
		classroom,
		mapping_coach_classroom,
		authentication
		where
		class.id = '${class_id}' and
		authentication.id = ${coach_id} and
		authentication.id = mapping_coach_classroom.coach_id and
		classroom.id = class.classroom_id and
		mapping_coach_classroom.classroom_id = class.classroom_id
		;`,
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0]);
      }
    });
  });
}

function getQuestionCoach(filters) {
  const sqlQuery = {
    sql: `select
    id,
    class_id,
    description,
    fen_question,
    deadline,
    created_at
  from
    question
  where
    ${(filters.class_id) ? `class_id = ${filters.class_id} and\n` : ''}
    class_id in (
      select
        id as class_id
      from
        class
      where
        ${(filters.classroom_id) ? `classroom_id in (${filters.classroom_id}) and\n` : ''}
        classroom_id in (
          select
            classroom_id
          from
            mapping_coach_classroom
          where
            coach_id = ${filters.coach_id}
        )
    );`,
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

function addQuestion(question_details) {
  const sqlQuery = {
    sql: `insert into question(
			class_id,
      description,
      fen_question,
      deadline,
      created_at
		  )
		  values(
			${question_details.class_id},
			'${question_details.description}',
      '${question_details.fen_question}',
      ${question_details.deadline},
			unix_timestamp(now())*1000
		  );`,
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

function deleteQuestion(question_id) {
  const sqlQuery = {
    sql: `delete
    from
    question
		where
    id = ${question_id}
    ;`,
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

function getSolutionCoach(filters) {
  const sqlQuery = {
    sql: `select
    concat(solution.student_id, solution.question_id) as solution_id,
    question.id as question_id,
    question.class_id,
    question.description,
    question.fen_question,
    question.deadline as question_deadline,
    question.created_at question_created_at,
    solution.student_id,
    solution.pgn,
    solution.score,
    solution.comments,
    solution.is_evaluated,
    solution.updated_at as solution_updated_at
  from
    question
    left outer join solution on solution.question_id = question.id
  where
    ${(filters.student_id) ? `solution.student_id in (${filters.student_id}) and\n` : ''}
    ${(filters.question_id) ? `question.id in (${filters.question_id}) and\n` : ''}
    question.id = solution.question_id
    and question.id in (
      select
        id as question_id
      from
        question
      where
      ${(filters.class_id) ? `class_id in (${filters.class_id}) and\n` : ''}
        class_id in (
          select
            id as class_id
          from
            class
          where
            ${(filters.classroom_id) ? `classroom_id in (${filters.classroom_id}) and\n` : ''}
            classroom_id in (
              select
                classroom_id
              from
                mapping_coach_classroom
              where
                coach_id = ${filters.coach_id}
            )
        )
    )`,
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

function getQuestionSolutionStudent(filters) {
  const sqlQuery = {
    sql: `select
    concat(solution.student_id,solution.question_id) as solution_id,
    question.id as question_id,
    question.class_id,
    question.description,
    question.fen_question,
    question.deadline as question_deadline,
    question.created_at question_created_at,
    solution.student_id,
    solution.pgn,
    solution.score,
    solution.comments,
    solution.is_evaluated,
    solution.updated_at as solution_updated_at
  from
    question
    left outer join (
      select
        *
      from
        solution
      where
        student_id = ${filters.student_id}
    ) as solution on solution.question_id = question.id
  where
  ${(filters.class_id) ? `class_id in (${filters.class_id}) and\n` : ''}
    class_id in (
    select
      id as class_id
    from
      class
    where
      ${(filters.classroom_id) ? `classroom_id in (${filters.classroom_id}) and\n` : ''}
      classroom_id in (
        select
          classroom_id
        from
          mapping_student_classroom
        where
        student_id = ${filters.student_id}
      )
  )
  ;`,
    timeout: config.db.queryTimeout,
  };
  return new Promise((resolve, reject) => {
    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

function addSolution(solution_details) {
  const sqlQuery = {
    sql: `insert into solution(
      question_id,
      student_id,
      pgn,
      updated_at
      )
      values(
      ${solution_details.question_id},
      '${solution_details.student_id}',
      '${solution_details.pgn}',
      unix_timestamp(now())*1000
      )
        on duplicate key
        update
        pgn = '${solution_details.pgn}',
        updated_at = unix_timestamp(now())*1000
      ;`,
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

function updateSolution(solution_update_details) {
  const sqlQuery = {
    sql: `update
    solution
    set
    score = ${solution_update_details.score},
    comments = '${solution_update_details.comments}',
    is_evaluated = ${1}
    where
    question_id = ${solution_update_details.question_id} and
    student_id = ${solution_update_details.student_id}
    ;`,
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

function deleteSolution(question_id, student_id) {
  const sqlQuery = {
    sql: `delete
    from
    solution
    where
    question_id = ${question_id} and
    student_id = ${student_id}
    ;`,
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
  getStudentsAdmin,
  getStudentsCoach,
  getCoaches,
  getUsers,
  editClassroom,
  getClassroomsStudent,
  getClassroomsCoach,
  getClass,
  addClass,
  deleteClass,
  checkClassroomAccessPrivilegeCoach,
  checkClassroomAccessPrivilegeStudent,
  enterClassStudent,
  enterClassCoach,
  enterClassAdmin,
  startClass,
  endClass,
  checkClassAccessPrivilegeCoach,
  checkClassAccessPrivilegeStudent,
  addQuestion,
  getQuestionCoach,
  deleteQuestion,
  addSolution,
  getSolutionCoach,
  getQuestionSolutionStudent,
  deleteSolution,
  updateSolution,
  updateCoachExtras,
  getCoachExtras,
};
