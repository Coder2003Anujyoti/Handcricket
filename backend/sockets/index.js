const knockoutsocket=require("../manager/knockoutsocket")
const roundrobinsocket=require("../manager/roundrobinsocket")
const oneversusonesocket=require("../manager/oneversusonesocket")
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
   knockoutsocket(io,socket) 
   roundrobinsocket(io,socket)
   oneversusonesocket(io,socket)
  });
};