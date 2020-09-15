const express = require('express');
const sqlConnector = require('../sql/connector');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Server Test Passed');
});

/**
 * Register a new user (student)
 */
router.post('/register_student', (req, res) => {
  const email = req.body.email;
  const passwordHash = req.body.password;
  sqlConnector.getUserID(email).then((userId) => {
    if(userId) {
      res.send({ 'id': userId, 'user': req.body.email, 'created': false });
    } else {
      sqlConnector.createUserInDatabase(email, passwordHash, 'student').then((status) => {
        sqlConnector.getUserID(email).then((userId) => {
          res.send({ 'id': userId, 'user': req.body.email, 'created': true });
        })
      }, (error) => {
        console.log(error);
        res.status(500).send("ERROR creating user" + error);
      })
    }
  });
});

/**
 * Register a new user (coach)
 */
router.post('/register_coach', (req, res) => {
  const email = req.body.email;
  const passwordHash = req.body.password;
  sqlConnector.getUserID(email).then((userId) => {
    if(userId) {
      res.send({ 'id': userId, 'user': req.body.email, 'created': false });
    } else {
      sqlConnector.createUserInDatabase(email, passwordHash, 'coach').then((status) => {
        sqlConnector.getUserID(email).then((userId) => {
          res.send({ 'id': userId, 'user': req.body.email, 'created': true });
        })
      }, (error) => {
        console.log(error);
        res.status(500).send("ERROR creating user" + error);
      })
    }
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
        sqlConnector.getUserDetails(email).then((response_arr) =>{
          res.send({ 'exists':true, 'id': response_arr[0], 'user_type': response_arr[1], 'created_at': response_arr[2] });
        })
      }
      else{
        res.send({ 'exists':false});
      }
    } 
    else {
      res.send({ 'exists':false});
    }
  });
});

module.exports = router;

