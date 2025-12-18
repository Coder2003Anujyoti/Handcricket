const knockoutsocket=require("../manager/knockoutsocket")
const roundrobinsocket=require("../manager/roundrobinsocket")
const oneversusonesocket=require("../manager/oneversusonesocket")
const knockusercountsocket=require("../manager/knockusercountsocket")
const roundusercountsocket=require("../manager/roundusercountsocket")
const seriesusercountsocket=require("../manager/seriesusercountsocket")
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
   knockoutsocket(io,socket) 
   roundrobinsocket(io,socket)
   oneversusonesocket(io,socket)
   knockusercountsocket(io,socket)
   roundusercountsocket(io,socket)
   seriesusercountsocket(io,socket)
  });
};