const sqlConnector = require('../sql/connector');

function handleGetClasses(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'student') {
      sqlConnector.checkClassroomAccessPrivilegeStudent(req.session.user_authentication.id, req.query.classroom_id).then((user_has_privilege) => {
        if (user_has_privilege) {
          sqlConnector.getClasses(req.query.classroom_id).then((class_array) => {
            console.log('class array sent for student');
            res.status(200).send(class_array);
          }).catch((error) => {
            console.log(error);
            res.status(500).send({
              error_type: 'database',
              error_code: error.code,
              error_message: error.sqlMessage,
            });
          });
        } else {
          console.log("unauthorized student trying to access class")
          res.sendStatus(403);
        }
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    } else if (req.session.user_authentication.user_type === 'coach') {
      sqlConnector.checkClassroomAccessPrivilegeCoach(req.session.user_authentication.id, req.query.classroom_id).then((user_has_privilege) => {
        if (user_has_privilege) {
          sqlConnector.getClasses(req.query.classroom_id).then((class_array) => {
            console.log('class array sent for coach');
            res.status(200).send(class_array);
          }).catch((error) => {
            console.log(error);
            res.status(500).send({
              error_type: 'database',
              error_code: error.code,
              error_message: error.sqlMessage,
            });
          });
        } else {
          console.log("unauthorized coach trying to access class ", req.session.user_authentication)
          res.sendStatus(403);
        }
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    } else if (req.session.user_authentication.user_type === 'admin') {
      sqlConnector.getClasses(req.query.classroom_id).then((class_array) => {
        console.log('class array sent for admin');
        res.status(200).send(class_array);
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    } else {
      console.log("unauthorized user with invalid user type trying to access class ", req.session.user_authentication);
      res.sendStatus(403);
    }
  } else {
    console.log("unauthorized user with no authentication trying to access class");
    res.sendStatus(403);
  }
}

function handleAddClass(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'coach') {
      sqlConnector.checkClassroomAccessPrivilegeCoach(req.session.user_authentication.id, req.body.class_details.classroom_id).then((user_has_privilege) => {
        if (user_has_privilege) {
          sqlConnector.addClass(req.body.class_details).then((response) => {
            console.log('class added by coach');
            res.send(response);
          }).catch((error) => {
            console.log(error);
            res.status(500).send({
              error_type: 'database',
              error_code: error.code,
              error_message: error.sqlMessage,
            });
          });
        } else {
          console.log("unauthorized coach trying to add class ", req.session.user_authentication)
          res.sendStatus(403);
        }
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    } else if (req.session.user_authentication.user_type === 'admin') {
      sqlConnector.addClass(req.body.class_details).then((response) => {
        console.log('class added by admin');
        res.send(response);
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    } else {
      console.log("unauthorized user with invalid user type trying to add class ", req.session.user_authentication);
      res.sendStatus(403);
    }
  } else {
    console.log("unauthorized user with no authentication trying to add class");
    res.sendStatus(403);
  }
}

function handleDeleteClass(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'coach') {
      sqlConnector.checkClassroomAccessPrivilegeCoach(req.session.user_authentication.id, req.query.classroom_id).then((user_has_privilege) => {
        if (user_has_privilege) {
          sqlConnector.deleteClass(req.query.class_id).then((response) => {
            console.log('class deleted by coach');
            res.status(201).send(response);
          }).catch((error) => {
            console.log(error);
            res.status(500).send({
              error_type: 'database',
              error_code: error.code,
              error_message: error.sqlMessage,
            });
          });
        } else {
          console.log("unauthorized coach trying to delete classroom ", req.session.user_authentication)
          res.sendStatus(403);
        }
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    } else if (req.session.user_authentication.user_type === 'admin') {
      sqlConnector.deleteClass(req.query.class_id).then((response) => {
        console.log('class deleted by admin');
        res.status(201).send(response);
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    } else {
      console.log("unauthorized user with invalid user type trying to delete class ", req.session.user_authentication);
      res.sendStatus(403);
    }
  } else {
    console.log("unauthorized user with no authentication trying to delete class");
    res.sendStatus(403);
  }
}

function handleClassEntry(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'student') {
      sqlConnector.enterClassStudent(req.session.user_authentication.id, req.query.class_hash).then((this_class) => {
        if (this_class) {
          console.log('class accessed by student');
          res.status(200).send(this_class);
        }
        else {
          console.log('invalid class access by student ' + req.session.user_authentication.id);
          res.sendStatus(403);
        }
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    }
    else if (req.session.user_authentication.user_type === 'coach') {
      sqlConnector.enterClassCoach(req.session.user_authentication.id, req.query.class_hash).then((this_class) => {
        if (this_class) {
          console.log('class accessed by coach');
          res.status(200).send(this_class);
        }
        else {
          console.log('invalid class access by coach ' + req.session.user_authentication.id);
          res.sendStatus(403);
        }
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    }
    else if (req.session.user_authentication.user_type === 'admin') {
      sqlConnector.enterClassAdmin(req.query.class_hash).then((this_class) => {
        console.log('class accessed by admin');
        res.status(200).send(this_class);
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    }
    else {
      console.log("unauthorized user with invalid user type trying to delete class ", req.session.user_authentication);
      res.sendStatus(403);
    }
  }
  else {
    console.log("unauthorized user with no authentication trying access class with hash", req.query.class_hash);
    res.sendStatus(403);
  }
}

function handleClassStart(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'coach') {
      sqlConnector.startClass(req.query.class_hash, req.session.user_authentication.id).then(() => {
        console.log('class started by coach');
        res.sendStatus(200);
      }).catch((error) => {
        console.log(error);
        if (error.error && error.error === 'invalid_user_id') {
          console.log("unauthorized coach trying to start class ", req.session.user_authentication);
          res.status(403).send({
            error_type: 'invalid_user_id',
          });
        }
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    }
    else {
      console.log("unauthorized user with invalid user type trying to start class ", req.session.user_authentication);
      res.sendStatus(403);
    }
  }
  else {
    console.log("unauthorized user with no authentication trying start class with hash", req.query.class_hash);
    res.sendStatus(403);
  }
}

function handleClassEnd(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'coach') {
      sqlConnector.endClass(req.query.class_hash, req.session.user_authentication.id).then(() => {
        console.log('class ended by coach');
        res.sendStatus(200);
      }).catch((error) => {
        console.log(error);
        if (error.error && error.error === 'invalid_user_id') {
          console.log("unauthorized coach trying to end class ", req.session.user_authentication);
          res.status(403).send({
            error_type: 'invalid_user_id',
          });
        }
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    }
    else {
      console.log("unauthorized user with invalid user type trying to end class ", req.session.user_authentication);
      res.sendStatus(403);
    }
  }
  else {
    console.log("unauthorized user with no authentication trying end class with hash", req.query.class_hash);
    res.sendStatus(403);
  }
}

module.exports = {
  handleGetClasses,
  handleAddClass,
  handleDeleteClass,
  handleClassEntry,
  handleClassStart,
  handleClassEnd
}