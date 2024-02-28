const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Enable CORS for all origins
app.use(cors());



const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'] // Allow only GET and POST requests
  }
});

app.use(express.static(__dirname + '/public'));

// Track live users
let liveUsers = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  // User login
  socket.on('login', (username) => {
    liveUsers[username] = socket.id;
    io.emit('liveUsers', Object.keys(liveUsers));
  });

  // User disconnect
  socket.on('disconnect', () => {
    const username = Object.keys(liveUsers).find(key => liveUsers[key] === socket.id);
    delete liveUsers[username];
    io.emit('liveUsers', Object.keys(liveUsers));
    console.log('User disconnected');
  });

  // Private messaging
  socket.on('privateMessage', ({ recipientUsername, message }) => {
    const recipientSocketId = liveUsers[recipientUsername];
    io.to(recipientSocketId).emit('privateMessage', { sender: socket.id, message });
  });
});


server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
