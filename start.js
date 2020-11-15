const socketio = require('socket.io');
const app = require('./app');

const config = require('./config');

// server.listen(config.servicePort, config.serviceIP, () => {
//   // eslint-disable-next-line no-console
//   console.log(`Express is running on port ${server.address().port}`);
// });

const server = app.listen(config.servicePort, config.serviceIP, () => {
  // eslint-disable-next-line no-console
  console.log(`Express is running on port ${server.address().port}`);
});

const io = socketio(server, { cors: true, origins: '*:*' });
io.on('connection', (socket) => {
  console.log('connect');
  socket.send('test messgae');
});
