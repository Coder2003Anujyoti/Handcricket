const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const setupSockets = require('./sockets/index');
const knockouts=require("./files/knockouts.js")
const roundrobin=require("./files/roundrobin.js")
const oneversusone=require("./files/oneversusone.js")
const aliens=require("./files/aliens.js")
const bodyParser = require('body-parser');
const cors=require('cors');
const app = express();
const  connectDB = require('./db/config.js');
const dotenv = require('dotenv');
dotenv.config();
connectDB();
app.use(cors({
  origin:'*'
}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true}));
app.use(knockouts)
app.use(roundrobin)
app.use(aliens)
app.use(oneversusone)
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  },
  transports: ["websocket"], 
  pingInterval: 25000,  
  pingTimeout: 15000
});
setupSockets(io);
server.listen(8000, () => {
  console.log('Server running on port 8000');
});