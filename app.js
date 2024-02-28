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
let colors = {};
//let selectedUsername="";
let selectedFontColor="#7e0303";

io.on('connection', (socket) => {
  console.log('A user connected');

  // User login
  socket.on('login', (username) => {    
    liveUsers[username] = socket.id;
    io.emit('liveUsers', Object.keys(liveUsers));
  });

    // User login
    socket.on('setFontColor', (color) => {
      selectedFontColor=color;
      colors[socket.id] = color;
      //console.log(color);
    });

  // User disconnect
  socket.on('disconnect', () => {
    const username = Object.keys(liveUsers).find(key => liveUsers[key] === socket.id);
    delete liveUsers[username];
    io.emit('liveUsers', Object.keys(liveUsers));
    console.log('User disconnected');
  });

  // Public messaging
socket.on('publicMessage', (message) => {

   let socketId = socket.id;
   let selectedUsername = getUsernameBySocketId(socketId, liveUsers); 
  io.emit('publicMessage', { selectedUsername, sender: socket.id, message, selectedFontColor, colors  });
});


  // Private messaging
  socket.on('privateMessage', ({ recipientUsername, message }) => {
    const recipientSocketId = liveUsers[recipientUsername];
    let socketId = socket.id;
    let selectedUsername = getUsernameBySocketId(socketId, liveUsers); 
    
    io.to(recipientSocketId).emit('privateMessage', { selectedUsername, sender: socket.id, message, selectedFontColor, colors });
  });


});


function getUsernameBySocketId(socketId, liveUsers) {
  let username;

    // Iterate through the keys of liveUsers object
    for (let key in liveUsers) {
        if (liveUsers.hasOwnProperty(key)) {
            // Check if the socket id matches
            if (liveUsers[key] === socketId) {
                username = key; // Get the username corresponding to the socket id
                break; // Exit loop once username is found
            }
        }
    }

  return username;
}


server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
