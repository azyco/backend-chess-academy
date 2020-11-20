/* eslint-disable no-console */
const socketio = require('socket.io');
const app = require('./app');

const config = require('./config');

const server = app.listen(config.servicePort, config.serviceIP, () => {
  // eslint-disable-next-line no-console
  console.log(`Express is running on port ${server.address().port}`);
});

let sharedInMemoryObject = {}

const io = socketio(server, { cors: true, origins: '*:*' });
io.on('connection', (socket) => {

  socket.on('enter', (class_hash) => {
    socket.join(class_hash)
    if (sharedInMemoryObject[class_hash]) {
      console.log('someone entered an ongoing class, sending chat and board state', sharedInMemoryObject[class_hash]);
    }
    else{
      console.log('someone entered a new class, setting states as null');
      sharedInMemoryObject[class_hash] = {board_history:[],chat_history:[]}
    }
    socket.emit('board_init', {board_history:sharedInMemoryObject[class_hash].board_history, class_hash:class_hash});
    socket.emit('chat_init', {chat_history:sharedInMemoryObject[class_hash].chat_history, class_hash:class_hash});
  })

  socket.on('chat', (data) => {
    data_json = JSON.parse(data);
    console.log('new chat message from UI', data_json);
    sharedInMemoryObject[data_json.class_hash].chat_history.push(data_json.chat);
    socket.to(data_json.class_hash).emit('chat', {chat:data_json.chat, class_hash: data_json.class_hash});
  });

  socket.on('board', (data) => {
    data_json = JSON.parse(data);
    console.log('new board state from UI', data_json);
    sharedInMemoryObject[data_json.class_hash].board_history.push(data_json.fen);
    socket.to(data_json.class_hash).emit('board', {fen:data_json.fen, class_hash:data_json.class_hash});
  });
});
