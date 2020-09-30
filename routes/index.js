const express = require('express');
const sqlConnector = require('../sql/connector');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('pong');
});

router.get('/login', (req, res) => {
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
});

/**
 * Login a user by checking password hash
 */
router.post('/login', (req, res) => {
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
});

router.delete('/login', (req, res) => {
  req.session.destroy(() => {
    res.status(204).send();
  })
});

/**
 * Register a new user (student)
 * also, maybe not check the existence of a user beforehand ?
 * the error code from the database itself will show the error in the inputs
 */
router.post('/student', (req, res) => {
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
      contact: (req.body.registration_details.contact) ? parseInt(req.body.registration_details.contact) : null,
      alt_contact: (req.body.registration_details.alt_contact) ? parseInt(req.body.registration_details.alt_contact) : null,
      contact_code: (req.body.registration_details.contact_code) ? parseInt(req.body.registration_details.contact_code) : null,
      alt_contact_code: (req.body.registration_details.alt_contact_code) ? parseInt(req.body.registration_details.alt_contact_code) : null,
      lichess_id: req.body.registration_details.lichess_id,
      dob: req.body.registration_details.dob,
      parent: req.body.registration_details.parent,
      is_private_contact: 1,
      is_private_alt_contact: 1,
      is_private_dob: 1,
      is_private_parent: 1
    }).then((response) => {
      console.log("user created");
      res.status(201).send();
      console.log("response sent");
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
});

/**
 * Register a new user (coach)
 */
router.post('/coach', (req, res) => {
  if (req.body.registration_details) {
    sqlConnector.createUserInDatabase({
      user_type: 'coach',
      email: req.body.registration_details.email,
      password: req.body.registration_details.password,
      fullname: req.body.registration_details.fullname,
      country: req.body.registration_details.country,
      state: req.body.registration_details.state,
      description: req.body.registration_details.description,
      image: req.body.registration_details.image,
      fide_id: req.body.registration_details.fide_id,
      contact: (req.body.registration_details.contact) ? parseInt(req.body.registration_details.contact) : null,
      alt_contact: (req.body.registration_details.alt_contact) ? parseInt(req.body.registration_details.alt_contact) : null,
      contact_code: (req.body.registration_details.contact_code) ? parseInt(req.body.registration_details.contact_code) : null,
      alt_contact_code: (req.body.registration_details.alt_contact_code) ? parseInt(req.body.registration_details.alt_contact_code) : null,
      lichess_id: req.body.registration_details.lichess_id,
      dob: req.body.registration_details.dob,
      parent: '',
      is_private_contact: 1,
      is_private_alt_contact: 1,
      is_private_dob: 1,
      is_private_parent: 1
    }).then((response) => {
      console.log("user created");
      res.status(201).send();
      console.log("response sent");
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
});

router.get('/profile', (req, res) => {
  if (req.session.user_authentication) {
    sqlConnector.getUserProfile(req.session.user_authentication.id).then((response) => {
      console.log("user profile retrieved");
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
});

router.put('/profile', (req, res) => {
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
});

module.exports = router;