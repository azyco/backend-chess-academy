const express = require('express');
const sqlConnector = require('../sql/connector');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('pong');
});

router.get('/profile', (req, res) => {
  if (req.session.user_details) {
    sqlConnector.getUserID(req.session.user_details.email).then((userId) => {
      if (userId != 0) {
        res.send({
          user_details: req.session.user_details
        });
      } else {
        res.sendStatus(403);
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
    res.sendStatus(403);
  }
});

router.get('/relogin', (req, res) => {
  if (req.session.user_details.email) {
    sqlConnector.getUserDetails(req.session.user_details.email).then((response) => {
      req.session.user_details = response.user_details;
      sqlConnector.getUserProfile(response.user_details.id).then((response) => {
        req.session.user_details = {
          ...req.session.user_details,
          ...response.user_profile
        };
        res.send({
          user_details: req.session.user_details,
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
    console.log(req.body.registration_details);
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
    console.log(req.body.registration_details);
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
      res.status(201).send();
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
          sqlConnector.getUserDetails(email).then((response) => {
            req.session.user_details = response.user_details;
            sqlConnector.getUserProfile(response.user_details.id).then((response) => {
              req.session.user_details = {
                ...req.session.user_details,
                ...response.user_profile
              };
              res.send({
                user_details: req.session.user_details,
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
          res.status(404).send({
            error_type: 'login_credentials'
          });
        }
      } else {
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

router.put('/user', (req, res) => {
  if (req.body.email &&
    req.body.updated_user_profile) {
    sqlConnector.getUserID(req.body.email).then((userID) => {
      sqlConnector.updateUserProfile(userID, req.body.updated_user_profile).then((response) => {
        res.send();
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
    console.log("Bad Data");
    res.sendStatus(400);
  }
});
module.exports = router;
