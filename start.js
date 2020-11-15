/* eslint-disable no-console */
const http = require('http');
const socketio = require('socketio');

const app = require('./app');
const config = require('./config');

const server = http.createServer(app);
const io = socketio(server);

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

server.listen(config.config.serviceIP, () => {
  // eslint-disable-next-line no-console
  console.log(`Express is running on port ${server.address().port}`);
});

// const server = app.listen(config.servicePort, config.serviceIP, () => {
//   // eslint-disable-next-line no-console
//   console.log(`Express is running on port ${server.address().port}`);
// });
