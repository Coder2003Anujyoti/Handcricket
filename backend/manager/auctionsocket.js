const characters = require("./pokemon.js");
const PlayerCollection= require('../schemas/poke.js');
let index={}
let pokemons={}
let rooms = {};
let auctions={}
let player={}
module.exports=(io,socket)=>{
console.log("Connected:", socket.id);
function shufflePokemons(arr) {
  const shuffled = [...arr]; 
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
function startAuction(id){
  if(!id || !pokemons[id] || !Array.isArray(pokemons[id])) return;
  let ind = index[id];
  if(typeof ind !== "number" || ind < 0 || ind >= pokemons[id].length) return;
  const current = pokemons[id][ind];
  if(!current) return;
  auctions[id] = {
    name: current.name || "",
    image: current.image || "",
    bid: 0,
    bidders: [],
    timer: 10
  };
  index[id] = ind + 1;
  if(rooms[id]) {
    io.to(id).emit("auction-start-game", {
      players: rooms[id],
      auction: auctions[id]
    });
  }
  startTimer(id);
}
function cleanup(roomId) {
  if (auctions[roomId]?.interval) {
    clearInterval(auctions[roomId].interval);
  }

  if (auctions[roomId]?.breakInterval) {
    clearInterval(auctions[roomId].breakInterval);
  }
  delete rooms[roomId];
  delete index[roomId];
  delete auctions[roomId];
  delete pokemons[roomId];
  delete player[roomId];
}
function checkBid(id){
  const pokemon = pokemons[id];
  const auction = auctions[id];
  if (!pokemon || !auction || !rooms[id]) return;
  let flag = -1;
  let poke = pokemon.map((i, ind) => {
    if (i.name === auction.name) {
      flag = ind;
      return {
        ...i,
        sold: (auction.bidders && auction.bidders.length > 0)
          ? auction.bidders[auction.bidders.length - 1]
          : "Unsold"
      };
    }
    return { ...i };
  });
  pokemons[id] = poke;
  if (auction.bidders && auction.bidders.length > 0 && flag !== -1) {
    const winner = auction.bidders[auction.bidders.length - 1];
    rooms[id] = rooms[id].map((player) => {
      if (player.name === winner && pokemon[flag]) {
        return {
          ...player,
          players: [...(player.players || []), pokemon[flag]],
          purse: (player.purse ?? 0) - (auction.bid ?? 0)
        };
      }
      return { ...player };
    });
  }
  if (!poke.some((i) => i.sold === "")) {
    let k = poke.filter((i) => i.sold === "Unsold");
    let idx = 0;
    rooms[id] = rooms[id].map(player => {
      let need = 5 - (player.players?.length || 0);
      if (need <= 0) return player;
      let add = k.slice(idx, idx + need);
      idx += need;
      return {
        ...player,
        players: [...(player.players || []), ...add]
      };
    });
    const finalPlayers = [...rooms[id]]; //
    io.to(id).emit("auction-final-updates", { players: rooms[id] }, () => {
    setImmediate(async () => {
  try {
    const doc = await PlayerCollection.findOne({ id });

    if (!doc) return;

    doc.contestants = doc.contestants.map(c => {
      const p = finalPlayers.find(x => x.name === c.name);

      if (p) {
        return {
          ...c,
          players: p.players || [],
          purse: p.purse
        };
      }

      return c;
    });

    doc.markModified("contestants");
    doc.auctionStarted = false;

    await doc.save();

  } catch (err) {
    console.error(err);
  }
});
  cleanup(id);
});
  } else {
    io.to(id).emit("auction-updates", {
      players: rooms[id],
      data: auctions[id]
    });
  }
}
function startTimer(roomId) {
  const auction = auctions[roomId];
  if (!auction) return;

  if (auction.interval) clearInterval(auction.interval);

  auction.interval = setInterval(() => {
    if (!auctions[roomId]) {
      clearInterval(auction.interval);
      return;
    }

    auctions[roomId].timer--;

    io.to(roomId).emit("auction-timer", auctions[roomId].timer);

    if (auctions[roomId].timer <= 0) {
      clearInterval(auction.interval);

      checkBid(roomId);

      let wait = 5;

      io.to(roomId).emit("auction-round-end", {
        message: "Round ended",
        nextIn: wait
      });

      auction.breakInterval = setInterval(() => {
        if (!auctions[roomId]) {
          clearInterval(auction.breakInterval);
          return;
        }

        wait--;

        io.to(roomId).emit("auction-round-end", {
          nextIn: wait
        });

        if (wait <= 0) {
          clearInterval(auction.breakInterval);
          if (auctions[roomId]) startAuction(roomId);
        }
      }, 1000);
    }
  }, 1000);
}
socket.on("join-auction-room", async (msg) => {
  if (!msg || !msg.name || !msg.id) return;
  const name = msg.name;
  const roomId = msg.id;
  for (const roomID in rooms) {
if (rooms[roomID].find(p => p.name === name)) {
socket.emit("auction-wait", {
  msg:"Already joined in another room..."});
return;
}}
  const doc = await PlayerCollection.findOne({ id: roomId });
  if (!doc) return;

  const isCompleted = doc.contestants?.every(
    c => (c.players?.length || 0) === 5
  );

  if (isCompleted) {
    socket.emit("auction-wait", {
      msg: "Auction already completed..."
    });
    return;
  }
  if (!rooms[roomId]) {
    rooms[roomId] = [];
    player[roomId]=[]
  }
  if (!Array.isArray(rooms[roomId])) return;
  if (rooms[roomId].length >= 4) {
    socket.emit("auction-wait", {
      msg: "Room is Full...."
    });
    return;
  }
  socket.join(roomId);
  rooms[roomId].push({
    id: socket.id,
    name,
    players: [],
    roomID: roomId,
    purse: 5000
  });
  player[roomId].push({
    id: socket.id,
    name,
    players: [],
    roomID: roomId,
    purse: 5000
  })
  console.log(rooms[roomId])
  if (rooms[roomId].length < 4) {
    io.to(roomId).emit("auction-wait", {
      msg: "Waiting for others....."
    });
  }
  if (rooms[roomId].length === 4) {
    setImmediate(async () => {
      try {
        const doc = await PlayerCollection.findOne({ id: roomId });
if (!doc) return;              

        if (doc) {
          doc.auctionStarted = true;

          if (Array.isArray(doc.contestants)) {
            doc.contestants.forEach(c => {
              c.players = [];
            });

            // 🔥 Required for nested array updates
            doc.markModified("contestants");
          }

          await doc.save();
        }
      } catch (err) {
        console.error("DB reset error:", err);
      }
    });
    index[roomId] = 0;
    let updatedPokemons = shufflePokemons(characters);
    pokemons[roomId] = updatedPokemons
      .slice(0,20)
      .map(i => ({ ...i, sold: "" }));
    if (pokemons[roomId]?.length) {
      startAuction(roomId);
    }
  }
});
socket.on("move-auction-bid", (msg) => {
  const id = msg.id;
  if (!auctions[id] || !rooms[id]) return;
  if (typeof auctions[id].bid !== "number") {
    auctions[id].bid = 0;
  }
  if (!Array.isArray(auctions[id].bidders)) {
    auctions[id].bidders = [];
  }
  if (!msg || !msg.name) return;
  const lastBidder = auctions[id].bidders[auctions[id].bidders.length - 1];
  if (lastBidder === msg.name) return;
  auctions[id].bid += 100;
  auctions[id].bidders.push(msg.name);
  io.to(id).emit("auction-bid-update", {
    bid: auctions[id].bid,
    bidders: auctions[id].bidders,
    room: rooms[id]
  });
});
socket.once('disconnect', () => {
  console.log("Player disconnected:", socket.id);
  for (const roomId in rooms) {
    if (!rooms[roomId] || !player[roomId]) continue;
    player[roomId] = (player[roomId] || []).filter(p => p.id !== socket.id);
    if (!Array.isArray(player[roomId])) continue;
    
    if (player[roomId].length === 1 && rooms[roomId].filter((i)=> i.id!=player[roomId][0].id && i.players.length == 5 ).length < 3) {
      setImmediate(async () => {
      try {
        const doc = await PlayerCollection.findOne({ id: roomId });
        if (!doc) return
        if (doc) {
          doc.auctionStarted = false;
          if (Array.isArray(doc.contestants)) {
            doc.contestants.forEach(c => {
              c.players = [];
            });
            // 🔥 Required for nested array updates
            doc.markModified("contestants");
          }
          await doc.save();
        }
      } catch (err) {
        console.error("DB reset error:", err);
      }
    });
      const lastUserId = player[roomId][0]?.id;
      if (lastUserId) {
        io.to(lastUserId).emit("auction-Left", "A player has been disconnected...");
      }
      if (auctions[roomId]?.interval) clearInterval(auctions[roomId].interval);
      if (auctions[roomId]?.breakInterval) clearInterval(auctions[roomId].breakInterval);
      delete rooms[roomId];
      delete index[roomId];
      delete auctions[roomId];
      delete pokemons[roomId];
      delete player[roomId];
      break;
    }
    if (player[roomId].length === 0) {
      setImmediate(async () => {
      try {
        const doc = await PlayerCollection.findOne({ id: roomId });
if (!doc) return;

        if (doc) {
          doc.auctionStarted = false;

          if (Array.isArray(doc.contestants)) {
            doc.contestants.forEach(c => {
              c.players = [];
            });

            // 🔥 Required for nested array updates
            doc.markModified("contestants");
          }

          await doc.save();
        }
      } catch (err) {
        console.error("DB reset error:", err);
      }
    });
      if (auctions[roomId]?.interval) clearInterval(auctions[roomId].interval);
      if (auctions[roomId]?.breakInterval) clearInterval(auctions[roomId].breakInterval);
      delete rooms[roomId];
      delete index[roomId];
      delete auctions[roomId];
      delete pokemons[roomId];
      delete player[roomId];
      break;
    }
  }
});
}