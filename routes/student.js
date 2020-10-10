const sqlConnector = require('../sql/connector');

function handleGetStudent(req, res) {
  if (req.session.user_authentication && req.session.user_authentication.user_type === 'admin') {
    sqlConnector.getStudents().then((studentArray) => {
      console.log('student array sent');
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
    res.sendStatus(403);
  }
}

/**
 * Register a new user (student)
 * also, maybe not check the existence of a user beforehand ?
 * the error code from the database itself will show the error in the inputs
 */
function handleCreateStudent(req, res) {
  if (req.body.registration_details) {
    sqlConnector.createUserInDatabase({
      user_type: 'student',
      email: req.body.registration_details.email,
      password: req.body.registration_details.password,
      fullname: req.body.registration_details.fullname,
      country: req.body.registration_details.country,
      state: req.body.registration_details.state,
      description: req.body.registration_details.description,
      image: req.body.registration_details.image,
      fide_id: req.body.registration_details.fide_id,
      contact: req.body.registration_details.contact,
      alt_contact: req.body.registration_details.alt_contact,
      contact_code: req.body.registration_details.contact_code,
      alt_contact_code: req.body.registration_details.alt_contact_code,
      lichess_id: req.body.registration_details.lichess_id,
      dob: req.body.registration_details.dob,
      parent: req.body.registration_details.parent,
      is_private_contact: 1,
      is_private_alt_contact: 1,
      is_private_dob: 1,
      is_private_parent: 1,
    }).then((response) => {
      console.log('user created', response);
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
    console.log('Bad Data');
    res.sendStatus(400);
  }
}

module.exports = {
  handleGetStudent,
  handleCreateStudent,
};
