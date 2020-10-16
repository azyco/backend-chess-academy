const sqlConnector = require('../sql/connector');

function handleGetClasses(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'student') {
      sqlConnector.checkClassroomAccessPrivilegeStudent(req.session.user_authentication.id, req.query.classroom_id).then((user_has_privilege) => {
        if (user_has_privilege) {
          sqlConnector.getClasses(req.query.classroom_id).then((class_array) => {
            console.log('class array sent');
            res.status(200).send(class_array);
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
      sqlConnector.checkClassroomAccessPrivilegeCoach(req.session.user_authentication.id, req.query.classroom_id).then((user_has_privilege) => {
        if (user_has_privilege) {
          sqlConnector.getClasses(req.query.classroom_id).then((class_array) => {
            console.log('class array sent');
            res.status(200).send(class_array);
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
      sqlConnector.getClasses(req.query.classroom_id).then((class_array) => {
        console.log('class array sent');
        res.status(200).send(class_array);
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    }
  } else {
    res.sendStatus(403);
  }
}

function handleAddClass(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'coach') {
      sqlConnector.checkClassroomAccessPrivilegeCoach(req.session.user_authentication.id, req.body.class_details.classroom_id).then((user_has_privilege) => {
        if (user_has_privilege) {
          sqlConnector.addClass(req.body.class_details).then((response) => {
            console.log('class added');
            res.send(response);
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
      sqlConnector.addClass(req.body.class_details).then((response) => {
        console.log('class added');
        res.send(response);
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    }

  }
  else {
    res.sendStatus(403);
  }
}

function handleDeleteClass(req, res) {
  if (req.session.user_authentication) {

    if (req.session.user_authentication.user_type === 'coach') {
      sqlConnector.checkClassroomAccessPrivilegeCoach(req.session.user_authentication.id, req.query.classroom_id).then((user_has_privilege) => {
        if (user_has_privilege) {
          sqlConnector.deleteClass(req.query.class_id).then((response) => {
            console.log('class deleted');
            res.status(201).send(response);
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
      sqlConnector.deleteClass(req.query.class_id).then((response) => {
        console.log('class deleted');
        res.status(201).send(response);
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    }

  } else {
    res.sendStatus(403);
  }
}

module.exports = {
  handleGetClasses,
  handleAddClass,
  handleDeleteClass
}