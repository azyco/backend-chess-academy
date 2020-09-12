const express = require('express');
const sqlConnector = require('../sql/connector');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('pong');
});

/**
 * Register a new user (student)
 */
router.post('/register', (req, res) => {
  const userName = req.body.username;
  const passwordHash = req.body.password;
  sqlConnector.getUserID(userName).then((userId) => {
    if(userId) {
      res.send({ 'id': userId, 'user': req.body.username, 'created': false });
    } else {
      sqlConnector.createUserInDatabase(userName, passwordHash, 'student').then((status) => {
        sqlConnector.getUserID(userName).then((userId) => {
          res.send({ 'id': userId, 'user': req.body.username, 'created': true });
        })
      }, (error) => {
        console.log(error);
        res.status(500).send("ERROR creating user" + error);
      })
    }
  });
});

module.exports = router;

