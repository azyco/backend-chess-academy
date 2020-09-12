const express = require('express');
const insertUser = require('../sql/connector');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('pong');
});

router.post('/register', (req, res) => {
  const response = { 'id': 1, 'user': req.body.username }
  res.send(response);
});

module.exports = router;

