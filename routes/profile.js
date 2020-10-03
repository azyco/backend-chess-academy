const sqlConnector = require('../sql/connector');

function handleGetProfile(req, res) {
    if (req.session.user_authentication) {
        sqlConnector.getUserProfile(req.session.user_authentication.id).then((response) => {
        console.log("user profile retrieved", response);
        res.send({
            user_profile: response.user_profile
        });
        }).catch((error) => {
            console.log(error);
            res.status(500).send({
                error_type: 'database',
                error_code: error.code,
                error_message: error.sqlMessage
            });
        });
    } else {
        console.log("Bad Data");
        res.sendStatus(400);
    }
}

function handleUpdateProfile(req, res) {
    if (req.body.email &&
      req.body.updated_user_profile) {
      if (req.body.email === req.session.user_authentication.email) {
        sqlConnector.getUserID(req.body.email).then((userID) => {
          sqlConnector.updateUserProfile(userID, req.body.updated_user_profile).then((response) => {
            sqlConnector.getUserProfile(req.session.user_authentication.id).then((response) => {
              res.send({
                user_profile: response.user_profile
              });
            }).catch(() => {
              console.log(error);
              res.status(500).send({
                error_type: 'database',
                error_code: error.code,
                error_message: error.sqlMessage
              });
            });
          }).catch((error) => {
            console.log(error);
            res.status(500).send({
              error_type: 'database',
              error_code: error.code,
              error_message: error.sqlMessage
            });
          });
        }).catch((error) => {
          console.log(error);
          res.status(500).send({
            error_type: 'database',
            error_code: error.code,
            error_message: error.sqlMessage
          });
        });
      } else {
        console.log("Unauthorized");
        res.sendStatus(401);
      }
    } else {
      console.log("Bad Data");
      res.sendStatus(400);
    }
  }

module.exports = {
    handleGetProfile,
    handleUpdateProfile
}