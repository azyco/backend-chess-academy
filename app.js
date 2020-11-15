/* eslint-disable no-console */
const http = require('http');
const socketio = require('socket.io');

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();

const server = http.createServer(app);
const io = socketio(server, {});

// create the socket IO stuff

io.on('connection', (socket) => {
  socket.on('message', (messageJson) => {
    console.log(`Received: ${messageJson}`);
    try {
      console.log(JSON.parse(messageJson));
    } catch (ex) {
      console.error(ex);
      socket.send('Bad Request format, use: \'{"action": ..., "data": ...}\'');
    }
  });
  socket.on('close', () => {
    console.log('close');
  });
});

// set the app HTTP routes

app.use(session({
  secret: 'secret_to_read_from_file_later',
  saveUninitialized: true,
  resave: false,
  cookie: {
    maxAge: 1000 * 60 * 60,
  },
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.get('Origin'));
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

app.use('/', require('./routes/index'));

module.exports = { app, server };
