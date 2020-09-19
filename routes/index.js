const express = require('express');
const sqlConnector = require('../sql/connector');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('pong');
});

router.get('/profile', (req, res) => {
  if(req.session.email) {
    sqlConnector.getUserID(req.session.email).then((userId) => {
      if(userId != 0) {
        res.send({
          id: userId,
          email: req.session.email
        });
      } else {
        res.sendStatus(403);
      }
    });
  } else {
    res.sendStatus(403);
  }
});

/**
 * Register a new user (student)
 */
router.post('/student', (req, res) => {
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
router.post('/coach', (req, res) => {
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
        sqlConnector.getUserDetails(email).then((response) => {
          req.session.email = response.email;
          res.send({
            exists: true,
            id: response.id,
            user_type: response.type,
            email: response.email,
            created_at: response.created_at
          });
        })
      }
      else{
        res.status(404).send("No such user or password mismatch");
      }
    } 
    else {
      res.status(404).send("No such user or password mismatch");
    }
  });
});

module.exports = router;
