const sqlConnector = require('../sql/connector');

function handleGetStudent(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'admin') {
      sqlConnector.getStudentsAdmin().then((studentArray) => {
        console.log('student array sent for admin');
        res.send({
          student_array: studentArray,
        });
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    } else if (req.session.user_authentication.user_type === 'coach') {
      const filters = {
        coach_id: req.session.user_authentication.id,
        classroom_id: req.query.classroom_id,
      }
      sqlConnector.getStudentsCoach(filters).then((studentArray) => {
        console.log('student array sent for coach');
        res.send({
          student_array: studentArray,
        });
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage,
        });
      });
    } else {
      console.log('unauthorized user with invalid user type trying to get students ', req.session.user_authentication);
      res.sendStatus(403);
    }
  } else {
    console.log('unauthorized user with no authentication trying to get students');
    res.sendStatus(403);
  }
}

/**
 * Register a new user (student)
 */
function handleCreateStudent(req, res) {
  if (req.body.registration_details) {
    sqlConnector.createUserInDatabase({
      user_type: 'student',
      ...req.body.registration_details,
      is_private_contact: 1,
      is_private_alt_contact: 1,
      is_private_dob: 1,
      is_private_parent: 1,
    }).then((response) => {
      console.log('student created', req.body.registration_details.email);
      res.status(201).send();
      console.log('response sent');
    }).catch((error) => {
      console.log(error);
      res.status(500).send({
        error_type: 'database',
        error_code: error.code,
        error_message: error.sqlMessage,
      });
    });
  } else {
    console.log('bad request while trying to add student');
    res.sendStatus(400);
  }
}

module.exports = {
  handleGetStudent,
  handleCreateStudent,
};