const sqlConnector = require('../sql/connector');

function handleGetProfile(req, res) {
  if (req.session.user_authentication) {
    sqlConnector.getUserProfile(req.session.user_authentication.id).then((profile_response) => {
      console.log('user profile retrieved');
      if (req.session.user_authentication.user_type === 'coach') {
        sqlConnector.getCoachExtras(req.session.user_authentication.id).then((coach_extras_response) => {
          res.send({
            user_profile: profile_response.user_profile,
            coach_extras: coach_extras_response.coach_extras,
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
        res.send({
          user_profile: profile_response.user_profile,
        });
      }
    }).catch((error) => {
      console.log(error);
      res.status(500).send({
        error_type: 'database',
        error_code: error.code,
        error_message: error.sqlMessage,
      });
    });
  } else {
    console.log('unauthorized user with no authentication trying to access profile ', req.session.user_authentication);
    res.sendStatus(403);
  }
}

function handleUpdateProfile(req, res) {
  if (req.session.user_authentication) {
    if (req.session.user_authentication.user_type === 'student' || req.session.user_authentication.user_type === 'coach') {
      if (req.body.email
        && req.body.updated_user_profile) {
        if (req.body.email === req.session.user_authentication.email) {
          sqlConnector.getUserID(req.body.email).then((userID) => {
            sqlConnector.updateUserProfile(userID, req.body.updated_user_profile).then(() => {
              if (req.session.user_authentication.user_type === 'coach') {
                sqlConnector.updateCoachExtras(userID, req.body.updated_user_profile).then(() => {
                  res.sendStatus(200);
                }).catch((error) => {
                  console.log(error);
                  res.status(500).send({
                    error_type: 'database',
                    error_code: error.code,
                    error_message: error.sqlMessage,
                  });
                });
              } else {
                res.sendStatus(200);
              }
            }).catch((error) => {
              console.log(error);
              res.status(500).send({
                error_type: 'database',
                error_code: error.code,
                error_message: error.sqlMessage,
              });
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
          console.log('unauthorized user with email mismatch trying to edit profile ', req.session.user_authentication);
          res.sendStatus(403);
        }
      } else {
        console.log('bad request while trying to edit profile');
        res.sendStatus(400);
      }
    } else {
      console.log('unauthorized user with invalid user type trying to edit profile ', req.session.user_authentication);
      res.sendStatus(403);
    }
  } else {
    console.log('unauthorized user with no authentication trying to edit profile');
    res.sendStatus(403);
  }
}

module.exports = {
  handleGetProfile,
  handleUpdateProfile,
};
