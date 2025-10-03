const knockoutsocket=require("../manager/knockoutsocket")
const roundrobinsocket=require("../manager/roundrobinsocket")
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
   knockoutsocket(io,socket) 
   roundrobinsocket(io,socket)
  });
};