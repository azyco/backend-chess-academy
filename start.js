/* eslint-disable no-console */
const socketio = require('socket.io');
const app = require('./app');

const config = require('./config');

const server = app.listen(config.servicePort, config.serviceIP, () => {
  // eslint-disable-next-line no-console
  console.log(`Express is running on port ${server.address().port}`);
});

let sharedInMemoryObject = null;

const io = socketio(server, { cors: true, origins: '*:*' });
io.on('connection', (socket) => {
  if (sharedInMemoryObject) {
    io.emit('board', sharedInMemoryObject);
  }

  socket.on('chat', (msg) => {
    console.log('new chat message from UI', msg);
    sharedInMemoryObject = msg;
    io.emit('board', sharedInMemoryObject);
  });
});
