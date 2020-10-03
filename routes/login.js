const sqlConnector = require('../sql/connector');

function handleGetLogin (req, res) {
    if (req.session.user_authentication) {
      sqlConnector.getUserID(req.session.user_authentication.email).then((userId) => {
        if (userId != 0) {
          res.send({
            user_authentication: req.session.user_authentication
          });
          console.log("Session Restored");
        } else {
          console.log("Expired/Bad Session");
          res.sendStatus(401);
        }
      }).catch((error) => {
        console.log(error);
        res.status(500).send({
          error_type: 'database',
          error_code: error.code,
          error_message: error.sqlMessage
        });
      });
    } else {
      console.log("Expired/Bad Session");
      res.sendStatus(401);
    }
}

/**
 * Login a user by checking password hash
 */
function handleCreateLogin(req, res) {
    if (req.body.email &&
      req.body.password_hash) {
      const email = req.body.email;
      const input_password_hash = req.body.password_hash;
      sqlConnector.getPasswordHash(email).then((db_password_hash) => {
        if (db_password_hash) {
          if (input_password_hash == db_password_hash) {
            sqlConnector.getUserAuthentication(email).then((response) => {
              req.session.user_authentication = response.user_authentication;
              console.log("user logged in");
              res.send({
                user_authentication: response.user_authentication,
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
            console.log("bad login details");
            res.status(404).send({
              error_type: 'login_credentials'
            });
          }
        } else {
          console.log("bad login details");
          res.status(404).send({
            error_type: 'login_credentials'
          });
        }
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

  function handleLogout(req, res) {
    req.session.destroy(() => {
      res.status(204).send();
    })
  }

  module.exports = {
      handleGetLogin,
      handleCreateLogin,
      handleLogout
  }
