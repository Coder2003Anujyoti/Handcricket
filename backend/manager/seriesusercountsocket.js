const participants={}
 module.exports=(io,socket)=>{
 socket.on("increseries", ({ id, name }) => {
    socket.matchId = id;
    participants[id] = participants[id] || [];
      participants[id].push({
        socketId: socket.id,
        name
      });
    console.log(participants)
    io.emit("countseries", {count:[...new Set(participants[id].map((i)=> i.name))].length});
  });
  socket.on("disconnect", () => {
    const { matchId } = socket;
    if (!matchId || !participants[matchId]) return;
    participants[matchId] = participants[matchId].filter(
      (p) => p.socketId !== socket.id
    );
    io.emit("countseries",{count:[...new Set(participants[matchId].map((i)=> i.name))].length});
    if (participants[matchId].length === 0) {
      delete participants[matchId];
    }
  });
}