const knockoutsocket=require("../manager/knockoutsocket")
const roundrobinsocket=require("../manager/roundrobinsocket")
const oneversusonesocket=require("../manager/oneversusonesocket")
const auctionsocket=require("../manager/auctionsocket")
const gamingsocket=require("../manager/gamingsocket")
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
   knockoutsocket(io,socket) 
   roundrobinsocket(io,socket)
   oneversusonesocket(io,socket)
   auctionsocket(io,socket)
   gamingsocket(io,socket)
  });
};