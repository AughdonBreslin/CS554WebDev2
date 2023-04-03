const app = require('express');
const http = require('http').createServer(app);
var io = require('socket.io')(http);

io.on('connection', (socket) => {
  console.log('new client connected', socket.id);

  socket.on('user_join', (name, room) => {
    socket.join(room);
    console.log('A user joined their name is ' + name + ' and theyre in room '+ 0);
    socket.broadcast.emit('user_join', name);
  });

  socket.on('message', ({name, message, room}) => {
    console.log(name, message, room, socket.id);
    socket.to(room).emit('message', {name, message, room});
  });

  socket.on('disconnect', () => {
    console.log('Disconnect Fired');
  });
});

http.listen(4000, () => {
  console.log(`listening on *:${4000}`);
});
