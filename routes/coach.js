const sqlConnector = require('../sql/connector');

function handleGetCoach(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'admin') {
      sqlConnector.getCoaches().then((coachArray) => {
        console.log('coach array sent for admin');
        res.send({
          coach_array: coachArray,
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
      console.log('unauthorized user with invalid user type trying to get coaches ', req.session.user_authentication);
      res.sendStatus(403);
    }
  } else {
    console.log('unauthorized user with no authentication trying to get coaches');
    res.sendStatus(403);
  }
}

/**
 * Register a new user (coach)
 */
function handleCreateCoach(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'admin') {
      if (req.body.registration_details) {
        sqlConnector.createUserInDatabase({
          user_type: 'coach',
          ...req.body.registration_details,
          parent: '',
          is_private_contact: 1,
          is_private_alt_contact: 1,
          is_private_dob: 1,
          is_private_parent: 1,
        }).then(() => {
          console.log('coach created by admin', req.body.registration_details.email);
          res.status(201).send();
        }).catch((error) => {
          console.log(error);
          res.status(500).send({
            error_type: 'database',
            error_code: error.code,
            error_message: error.sqlMessage,
          });
        });
      } else {
        console.log('bad request while trying to add coach');
        res.sendStatus(400);
      }
    } else {
      console.log('unauthorized user with invalid user type trying to add coach ', req.session.user_authentication);
      res.sendStatus(403);
    }
  } else {
    console.log('unauthorized user with no authentication trying to add coach');
    res.sendStatus(403);
  }
}

module.exports = {
  handleGetCoach,
  handleCreateCoach,
};
