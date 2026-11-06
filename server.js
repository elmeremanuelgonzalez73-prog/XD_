const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado');

  // Cuando un usuario entra, avisamos a todos
  socket.on('userJoined', (username) => {
    // Guardamos el nombre en la sesión del socket
    socket.username = username;
    
    // Avisar a TODOS los conectados (incluyendo al que entra)
    io.emit('message', {
      user: 'Sistema',
      text: `${username} se ha unido al chat.`,
      time: new Date().toLocaleTimeString()
    });
  });

  // Recibir mensaje y enviarlo a todos
  socket.on('chatMessage', (data) => {
    io.emit('message', {
      user: data.user,
      text: data.text,
      time: new Date().toLocaleTimeString()
    });
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      io.emit('message', {
        user: 'Sistema',
        text: `${socket.username} ha salido del chat.`,
        time: new Date().toLocaleTimeString()
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
