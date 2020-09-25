const express = require('express');
const sqlConnector = require('../sql/connector');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('pong');
});

router.get('/profile', (req, res) => {
  if(req.session.user_details) {
    sqlConnector.getUserID(req.session.user_details.email).then((userId) => {
      if(userId != 0) {
        res.send({
          user_details: req.session.user_details
        });
      } else {
        res.sendStatus(403);
      }
    }).catch((error) => {
      console.log(error);
      res.status(500).send({error_type: 'database', error_code: error.code, error_message: error.sqlMessage});
    });
  } else {
    res.sendStatus(403);
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
  sqlConnector.createUserInDatabase({
    user_type:'student',
    email: req.body.email,
    password: req.body.password,
    fullname: req.body.fullname,
    country: req.body.country,
    state: req.body.state,
    description: req.body.description,
    image: req.body.image,
    fide_id: req.body.fide_id,
    contact: (req.body.contact)? parseInt(req.body.contact) : null,
    alt_contact: (req.body.alt_contact)? parseInt(req.body.alt_contact) : null,
    contact_code : (req.body.contact_code)? parseInt(req.body.contact_code) : null,
    alt_contact_code: (req.body.alt_contact_code)? parseInt(req.body.alt_contact_code) : null,
    lichess_id: req.body.lichess_id,
    dob: req.body.dob,
    parent: req.body.parent,
    is_private_contact: 1,
    is_private_alt_contact: 1,
    is_private_dob: 1,
    is_private_parent: 1
  }).then((response) => {
    sqlConnector.getUserID(req.body.email).then((userId) => {
      if(userId) {
        res.status(201).send();
      }
    }).catch((error) => {
      console.log(error);
      res.status(500).send({error_type: 'database', error_code: error.code, error_message: error.sqlMessage});
    });
  }).catch((error) => {
    console.log(error);
    res.status(500).send({error_type: 'database', error_code: error.code, error_message: error.sqlMessage});
  });
});

/**
 * Register a new user (coach)
 */
router.post('/coach', (req, res) => {
  sqlConnector.createUserInDatabase({
    user_type:'coach',
    email: req.body.email,
    password: req.body.password,
    fullname: req.body.fullname,
    country: req.body.country,
    state: req.body.state,
    description: req.body.description,
    image: req.body.image,
    fide_id: req.body.fide_id,
    contact: (req.body.contact)? parseInt(req.body.contact) : null,
    alt_contact: (req.body.alt_contact)? parseInt(req.body.alt_contact) : null,
    contact_code : (req.body.contact_code)? parseInt(req.body.contact_code) : null,
    alt_contact_code: (req.body.alt_contact_code)? parseInt(req.body.alt_contact_code) : null,
    lichess_id: req.body.lichess_id,
    dob: req.body.dob,
    parent: '',
    is_private_contact: 1,
    is_private_alt_contact: 1,
    is_private_dob: 1,
    is_private_parent: 1
  }).then((response) => {
    sqlConnector.getUserID(req.body.email).then((userId) => {
      if(userId) {
        res.status(201).send();
      }
    }).catch((error) => {
      console.log(error);
      res.status(500).send({error_type: 'database', error_code: error.code, error_message: error.sqlMessage});
    });
  }).catch((error) => {
    console.log(error);
    res.status(500).send({error_type: 'database', error_code: error.code, error_message: error.sqlMessage});
  });
});

/**
 * Login a user by checking password hash
 */
router.post('/login', (req, res) => {
  const email = req.body.email;
  const input_password_hash = req.body.password_hash;
  sqlConnector.getPasswordHash(email).then((db_password_hash) => {
    if(db_password_hash) {
      if(input_password_hash == db_password_hash){
        sqlConnector.getUserDetails(email).then((response) => {
          req.session.user_details = response.user_details;
          sqlConnector.getUserProfile(response.user_details.id).then((response) => {
            req.session.user_details = {...req.session.user_details, ...response.user_profile};
            res.send({
              user_details: req.session.user_details,
            });
          }).catch((error)=>{
            console.log(error);
            res.status(500).send({error_type: 'database', error_code: error.code, error_message: error.sqlMessage});
          });
        }).catch((error)=>{
          console.log(error);
          res.status(500).send({error_type: 'database', error_code: error.code, error_message: error.sqlMessage});
        });
      }
      else{
        res.status(404).send({error_type:'login_credentials'});
      }
    } 
    else {
      res.status(404).send({error_type:'login_credentials'});
    }
  }).catch((error)=>{
    console.log(error);
    res.status(500).send({error_type: 'database', error_code: error.code, error_message: error.sqlMessage});
  });
});

module.exports = router;
