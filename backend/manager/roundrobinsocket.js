const { v4: uuidv4 } = require('uuid');
const crypto=require("crypto")
const rooms={}
const turn={}
const game={}
const UserCollection=require('../schemas/players');
module.exports=(io,socket)=>{
  socket.on('dualjoinRooms', (msg) => {
    const name=msg.name
    const team=msg.team
    const player=msg.player
    const matchID=msg.matchID
    const matchtype=msg.matchtype
    let assignedRoom=null;
  for (const roomID in rooms) {
    const existingPlayer = rooms[roomID].find(p => p.name === name);
    if (existingPlayer) {
   socket.emit("dualwaits", "Already joined in another room...");
      return;
    }
  }
    for(const roomID in rooms){
      if(rooms[roomID].length<2){
        assignedRoom=roomID;
        break;
      }
    }
    if(!assignedRoom){
      assignedRoom=uuidv4();
      rooms[assignedRoom]=[]
    }
    rooms[assignedRoom].push({ id: socket.id, name, choice:0,team,player,matchID,matchtype});
    console.log(rooms[assignedRoom])
    socket.join(assignedRoom);
    console.log(`${name} joined room ${assignedRoom}`);
  if (rooms[assignedRoom].length === 1) {
      io.to(assignedRoom).emit('dualwaits', 'Waiting for another player...');
    }
    if (rooms[assignedRoom].length === 2) {
      const players = rooms[assignedRoom];
       turn[assignedRoom]=Math.floor(Math.random()*2);
       game[assignedRoom]={
         innings:1,
         scores:{
           [players[0].name]:0,
           [players[1].name]:0
         },
         turn:Math.random()>0.5?players[0].name:players[1].name,
         target:-1,
         result:""
       }
      io.to(assignedRoom).emit('dualstartGames', {
        roomId: assignedRoom,
        players,
        game:game[assignedRoom]
      });
       io.to(players[turn[assignedRoom]].id).emit('dualchoiceturns',"Your Turn")
     io.to(players[(turn[assignedRoom]+1)%2].id).emit('dualchoiceturns',"Opposition Turn")
    }
    socket.roomId = assignedRoom;
  })
socket.on('dualgomoves', async(item) => { 
  const roomId = socket.roomId; 
if (!roomId || !rooms[roomId]){
  socket.to(roomId).emit("dualLefts", "A player has been disconnected...");
  return;
} 
const player = rooms[roomId].find(p => p.id === socket.id); 
if (!player){
  socket.to(roomId).emit("dualLefts", "A player has been disconnected...");
return;
}
player.choice = item;
const players = rooms[roomId];
if(players.find((p) =>p.choice==0)==undefined){
  const [p1,p2]=players
  if(p1.choice!==p2.choice){
    const batter = players.find(p => p.name === game[roomId].turn);
    const bowler = players.find(p => p.name !== game[roomId].turn);
    const games = game[roomId]
  if(game[roomId].target==-1 || game[roomId].target> (game[roomId].scores[batter.name]+batter.choice)){
   game[roomId].scores[batter.name] += batter.choice;
  io.to(roomId).emit('dualmakescores', {
  players,
  game: game[roomId]
});
}
else{
  game[roomId].scores[batter.name] += batter.choice;
  game[roomId].result=`${batter.name} is winner`
    io.to(roomId).emit('dualmakescores', {
  players,
  game: game[roomId]
})
try {
  const user = await UserCollection.findOne({ id: players[0].matchID });
  if (!user) return;

  // Clone arrays so Mongoose detects changes
  let contestants = [...user.contestants];
  let knockouts = [...user.knockouts];
  let matches = [...user.matches];
  const nws=[...user.news]
const news=[`What a thriller between ${players[0].team.toUpperCase()} and ${players[1].team.toUpperCase()}!`,
    `A great knock from ${batter.name}, truly deserving the MoTM!`,
  `Masterclass by ${batter.name} what a performance!`,`${batter.name}'s all-round brilliance lights up the game!`,
  `What a great clash between ${players[0].team.toUpperCase()} and ${players[1].team.toUpperCase()}!`,
`A high-voltage clash ends in favour of ${players.filter((i)=> i.name == batter.name)[0].team.toUpperCase()}!`]
  // STEP 1: More than one knockout remaining
  if (knockouts.filter(i => i.winner === "").length > 1) {
    const playerone = contestants.find(i => i.name === batter.name);
    const playertwo = contestants.find(i => i.name === bowler.name);

    const match = knockouts.find(
      i =>
        (i.firstteam.name === batter.name && i.secondteam.name === bowler.name) ||
        (i.firstteam.name === bowler.name && i.secondteam.name === batter.name)
    );

    if (playerone && playertwo && match) {
      playerone.matches += 1;
      playertwo.matches += 1;
      playerone.win += 1;
      playertwo.lose += 1;

      playerone.nrr += parseFloat(
        (((games.scores[batter.name]) - (games.target - 1)) / playerone.matches).toFixed(2)
      );
      playertwo.nrr -= parseFloat(
        (((games.scores[batter.name]) - (games.target - 1)) / playertwo.matches).toFixed(2)
      );
      const ind=crypto.randomInt(0,news.length)
nws.pop()
nws.push({type:players[0].matchtype,content:news[ind],teamone:match.firstteam.team,teamtwo:match.secondteam.team,photo:players.filter((i)=> i.name == batter.name)[0].player})
      match.winner = batter.team;
      match.loser = bowler.team;
    }
  }

  // STEP 2: Only one knockout left (create Final + Third-Place)
  else if (knockouts.filter(i => i.winner === "").length === 1) {
    const playerone = contestants.find(i => i.name === batter.name);
    const playertwo = contestants.find(i => i.name === bowler.name);

    const match = knockouts.find(
      i =>
        (i.firstteam.name === batter.name && i.secondteam.name === bowler.name) ||
        (i.firstteam.name === bowler.name && i.secondteam.name === batter.name)
    );

    if (playerone && playertwo && match) {
      playerone.matches += 1;
      playertwo.matches += 1;
      playerone.win += 1;
      playertwo.lose += 1;

      playerone.nrr += parseFloat(
        (((games.scores[batter.name]) - (games.target - 1)) / playerone.matches).toFixed(2)
      );
      playertwo.nrr -= parseFloat(
        (((games.scores[batter.name]) - (games.target - 1)) / playertwo.matches).toFixed(2)
      );
     const ind=crypto.randomInt(0,news.length)
nws.pop()
nws.push({type:players[0].matchtype,content:news[ind],teamone:match.firstteam.team,teamtwo:match.secondteam.team,photo:players.filter((i)=> i.name == batter.name)[0].player})
      match.winner = batter.team;
      match.loser = bowler.team;
    }

    // Sort contestants for finals
    const participant = [...contestants].sort((a, b) => {
      if (b.win !== a.win) return b.win - a.win;
      return b.nrr - a.nrr;
    });

    const matchone = {
      firstteam: participant[0],
      secondteam: participant[1],
      winner: "",
      loser: "",
      type: "Final",
    };

    const matchtwo = {
      firstteam: participant[2],
      secondteam: participant[3],
      winner: "",
      loser: "",
      type: "Third-Place",
    };

    matches.push(matchone, matchtwo);
  }

  // STEP 3: Knockouts finished (Final or Third-Place result)
  else if (knockouts.filter(i => i.winner === "").length === 0) {
    const match = matches.find(
      it => it.firstteam.name === batter.name || it.secondteam.name === batter.name
    );

    if (match) {
      match.winner = batter.team;
      match.loser = bowler.team;

      if (match.type === "Final") {
        const ind=crypto.randomInt(0,news.length)
nws.pop()
nws.push({type:players[0].matchtype,content:news[ind],teamone:match.firstteam.team,teamtwo:match.secondteam.team,photo:players.filter((i)=> i.name == batter.name)[0].player})
        user.winner = batter.team;
        user.runnerup = bowler.team;
      } else if (match.type === "Third-Place") {
        const ind=crypto.randomInt(0,news.length)
nws.pop()
nws.push({type:players[0].matchtype,content:news[ind],teamone:match.firstteam.team,teamtwo:match.secondteam.team,photo:players.filter((i)=> i.name == batter.name)[0].player})
        user.thirdplace = batter.team;
      }
    }
  }

  // 🔑 Reassign updated arrays so mongoose sees changes
  user.contestants = contestants;
  user.knockouts = knockouts;
  user.matches = matches;
  user.news=nws;
  user.markModified("news")
  user.markModified("contestants");
user.markModified("knockouts");
user.markModified("matches");

  await user.save();
} catch (err) {
  console.error(err);
}

delete rooms[roomId]
  delete game[roomId]
  delete turn[roomId]
  io.in(roomId).socketsLeave(roomId);
  return;
}
  players.forEach((c)=>c.choice=0)
    io.to(players[turn[roomId]].id).emit('dualchoiceturns',"Your Turn")
     io.to(players[(turn[roomId]+1)%2].id).emit('dualchoiceturns',"Opposition Turn")
  }
  else{
    if(game[roomId].innings===1){
    const batter = players.find(p => p.name === game[roomId].turn);
    const bowler = players.find(p => p.name !== game[roomId].turn);
game[roomId].target=game[roomId].scores[batter.name]+1;
game[roomId].turn=bowler.name
game[roomId].innings=2;
      players.forEach((c)=>c.choice=0)
      io.to(roomId).emit('dualmakescores', {
  players,
  game: game[roomId]
});
}
else{
  const batter = players.find(p => p.name === game[roomId].turn);
  const bowler = players.find(p => p.name !== game[roomId].turn);
  const games = game[roomId]
  if(game[roomId].scores[bowler.name]==game[roomId].scores[batter.name]){
    game[roomId].result='Match is tied'
    io.to(roomId).emit('dualmakescores', {
  players,
  game: game[roomId]
})
}
  else
  {
    game[roomId].result=`${bowler.name} is winner`
    io.to(roomId).emit('dualmakescores', {
  players,
  game: game[roomId]
})
try {
  const user = await UserCollection.findOne({ id: players[0].matchID });
  if (!user) return;

  // Clone arrays so Mongoose tracks changes
  let contestants = [...user.contestants];
  let knockouts = [...user.knockouts];
  let matches = [...user.matches];
  const nws=[...user.news]
const news=[`What a thriller between ${players[0].team.toUpperCase()} and ${players[1].team.toUpperCase()}!`,
    `A great knock from ${bowler.name}, truly deserving the win!`,
  `Masterclass by ${bowler.name} what a performance!`,`${bowler.name}'s all-round brilliance lights up the game!`,
  `What a great clash between ${players[0].team.toUpperCase()} and ${players[1].team.toUpperCase()}!`,
`A high-voltage clash ends in favour of ${players.filter((i)=> i.name == bowler.name)[0].team.toUpperCase()}!`]
  // -------------------------------
  // CASE 1: More than 1 knockout match pending
  // -------------------------------
  if (knockouts.filter(i => i.winner === "").length > 1) {
    const playerone = contestants.find(i => i.name === batter.name);
    const playertwo = contestants.find(i => i.name === bowler.name);

    const match = knockouts.find(
      i =>
        (i.firstteam.name === batter.name && i.secondteam.name === bowler.name) ||
        (i.firstteam.name === bowler.name && i.secondteam.name === batter.name)
    );

    if (playerone && playertwo && match) {
      playerone.matches += 1;
      playertwo.matches += 1;

      playerone.lose += 1;
      playertwo.win += 1;

      playerone.nrr -= parseFloat(
        (((games.target - 1) - games.scores[batter.name]) / playerone.matches).toFixed(2)
      );
      playertwo.nrr += parseFloat(
        (((games.target - 1) - games.scores[batter.name]) / playertwo.matches).toFixed(2)
      );
 const ind=crypto.randomInt(0,news.length)
nws.pop()
nws.push({type:players[0].matchtype,content:news[ind],teamone:match.firstteam.team,teamtwo:match.secondteam.team,photo:players.filter((i)=> i.name == bowler.name)[0].player})
      match.winner = bowler.team;
      match.loser = batter.team;
    }
  }

  // -------------------------------
  // CASE 2: Exactly 1 knockout left → create Final + Third-Place
  // -------------------------------
  else if (knockouts.filter(i => i.winner === "").length === 1) {
    const playerone = contestants.find(i => i.name === batter.name);
    const playertwo = contestants.find(i => i.name === bowler.name);

    const match = knockouts.find(
      i =>
        (i.firstteam.name === batter.name && i.secondteam.name === bowler.name) ||
        (i.firstteam.name === bowler.name && i.secondteam.name === batter.name)
    );

    if (playerone && playertwo && match) {
      playerone.matches += 1;
      playertwo.matches += 1;

      playertwo.win += 1;
      playerone.lose += 1;

      playerone.nrr -= parseFloat(
        (((games.target - 1) - games.scores[batter.name]) / playerone.matches).toFixed(2)
      );
      playertwo.nrr += parseFloat(
        (((games.target - 1) - games.scores[batter.name]) / playertwo.matches).toFixed(2)
      );
const ind=crypto.randomInt(0,news.length)
nws.pop()
nws.push({type:players[0].matchtype,content:news[ind],teamone:match.firstteam.team,teamtwo:match.secondteam.team,photo:players.filter((i)=> i.name == bowler.name)[0].player})
      match.winner = bowler.team;
      match.loser = batter.team;
    }

    // Sort contestants for finals
    const participant = [...contestants].sort((a, b) => {
      if (b.win !== a.win) return b.win - a.win;
      return b.nrr - a.nrr;
    });

    const matchone = {
      firstteam: participant[0],
      secondteam: participant[1],
      winner: "",
      loser: "",
      type: "Final",
    };

    const matchtwo = {
      firstteam: participant[2],
      secondteam: participant[3],
      winner: "",
      loser: "",
      type: "Third-Place",
    };

    matches.push(matchone, matchtwo);
  }

  // -------------------------------
  // CASE 3: All knockouts finished → update Final / Third-Place result
  // -------------------------------
  else if (knockouts.filter(i => i.winner === "").length === 0) {
    const match = matches.find(
      it => it.firstteam.name === bowler.name || it.secondteam.name === bowler.name
    );

    if (match) {
      match.winner = bowler.team;
      match.loser = batter.team;

      if (match.type === "Final") {
      const ind=crypto.randomInt(0,news.length)
nws.pop()
nws.push({type:players[0].matchtype,content:news[ind],teamone:match.firstteam.team,teamtwo:match.secondteam.team,photo:players.filter((i)=> i.name == bowler.name)[0].player})
        user.winner = bowler.team;
        user.runnerup = batter.team;
      } else if (match.type === "Third-Place") {
    const ind=crypto.randomInt(0,news.length)
nws.pop()
nws.push({type:players[0].matchtype,content:news[ind],teamone:match.firstteam.team,teamtwo:match.secondteam.team,photo:players.filter((i)=> i.name == bowler.name)[0].player})
        user.thirdplace = bowler.team;
      }
    }
  }

  // ✅ Reassign so Mongoose knows arrays changed
  user.contestants = contestants;
  user.knockouts = knockouts;
  user.matches = matches;
  user.news=nws;
  user.markModified("news")
  user.markModified("contestants");
user.markModified("knockouts");
user.markModified("matches");


  await user.save();
} catch (err) {
  console.error(err);
}
}
  delete rooms[roomId]
  delete game[roomId]
  delete turn[roomId]
  io.in(roomId).socketsLeave(roomId);
  return;
}
          io.to(players[turn[roomId]].id).emit('dualchoiceturns',"Your Turn")
     io.to(players[(turn[roomId]+1)%2].id).emit('dualchoiceturns',"Opposition Turn")
  }
}
else{
  io.to(players[turn[roomId]].id).emit('dualchoiceturns',"Opposition Turn")
     io.to(players[(turn[roomId]+1)%2].id).emit('dualchoiceturns',"Your Turn")
}
});
socket.once('disconnect', () => {
  console.log("Player disconnected:", socket.id);

    for (const roomId in rooms) {
      const index = rooms[roomId].findIndex(p => p.id === socket.id);
      if (index !== -1) {
        rooms[roomId].splice(index, 1);

        if (rooms[roomId].length === 0) {
          delete rooms[roomId];
        } else {
          socket.to(roomId).emit("dualLefts", "A player has been disconnected...");
        }
        break; // Stop loop after finding the room
      }
    } // or just reuse logic
    console.log(rooms)
});
}