const { v4: uuidv4 } = require('uuid');
const PlayerCollection= require('../schemas/poke');
const rooms = {};
const turn = {};
const game = {};
module.exports=(io,socket)=>{
async function update_DB(batter,bowler,players,games){
  try {
  const user = await PlayerCollection.findOne({ id: players[0].matchID });
  if (!user) return;
  let contestants = [...user.contestants];
  let knockouts = [...user.knockouts];
  let matches = [...user.matches];
if (knockouts.filter(i => i.winner === "").length > 1) {
const playerone = contestants.find(i => i.name === batter.name);
const playertwo = contestants.find(i => i.name === bowler.name);
const match = knockouts.find(i =>
((i.firstteam.name === batter.name && i.secondteam.name === bowler.name) ||
(i.firstteam.name === bowler.name && i.secondteam.name === batter.name)) &&
i.winner === "");
if (playerone && playertwo && match) {
playerone.matches += 1;
playertwo.matches += 1;
playerone.win += 1;
playertwo.lose += 1;
playerone.nrr += parseFloat(
  (((games.scores[batter.name]) - (games.scores[bowler.name])) / 180).toFixed(2));
playertwo.nrr -= parseFloat((((games.scores[batter.name]) - (games.scores[bowler.name])) / 180).toFixed(2));
match.winner = batter.team;
match.loser = bowler.team;
}
}
else if (knockouts.filter(i => i.winner === "").length === 1) {
const playerone = contestants.find(i => i.name === batter.name);
const playertwo = contestants.find(i => i.name === bowler.name);
const match = knockouts.find(i =>
((i.firstteam.name === batter.name && i.secondteam.name === bowler.name) || (i.firstteam.name === bowler.name && i.secondteam.name === batter.name)) && i.winner === "");
if (playerone && playertwo && match) {
  playerone.matches += 1;
      playertwo.matches += 1;
      playerone.win += 1;
      playertwo.lose += 1;

      playerone.nrr += parseFloat(
  (((games.scores[batter.name]) - (games.scores[bowler.name])) / 180).toFixed(2));
playertwo.nrr -= parseFloat((((games.scores[batter.name]) - (games.scores[bowler.name])) / 180).toFixed(2));

      match.winner = batter.team;
      match.loser = bowler.team;
    }

    const participant = [...contestants].sort((a, b) => {
      if (b.win !== a.win) return b.win - a.win;
      return b.nrr - a.nrr;
    });

    matches.push(
      {
        firstteam: participant[0],
        secondteam: participant[1],
        winner: "",
        loser: "",
        type: "Final",
      },
      {
        firstteam: participant[2],
        secondteam: participant[3],
        winner: "",
        loser: "",
        type: "Third-Place",
      }
    );
  }
  else if (knockouts.filter(i => i.winner === "").length === 0) {
    const match = matches.find(
      it =>
        (it.firstteam.name === batter.name || it.secondteam.name === batter.name) &&
        it.winner === ""
    );

    if (match) {
      match.winner = batter.team;
      match.loser = bowler.team;

      if (match.type === "Final") {
        user.winner = batter.team;
        user.runnerup = bowler.team;
      } else if (match.type === "Third-Place") {
        user.thirdplace = batter.team;
      }
    }
  }

  const performance=players.flatMap((i)=>i.player)

  contestants = contestants.map(contestant => ({
    ...contestant,
    players: contestant.players.map(player => {
      const found = performance.find(p => p.name === player.name);

      if (found) {
        return {
          ...player,
          runs: player.runs + (found.runs || 0),
          wickets: player.wickets + (found.wickets || 0),
          team: contestant.team
        };
      }

      return player;
    })
  }));
  user.contestants = contestants;
  user.knockouts = knockouts;
  user.matches = matches;

  user.markModified("contestants");
  user.markModified("knockouts");
  user.markModified("matches");

  await user.save();

  io.emit("pokemon-updated-data", { user });



} catch (err) {
  console.error(err);
}
}
async function helper(teamone, teamtwo, matchtype, matchID) {
  try {
    const user = await PlayerCollection.findOne({ id: matchID });
    if (!user) return false;

    const isSameMatch = (i) =>
      (
        (i.firstteam.team === teamone && i.secondteam.team === teamtwo) ||
        (i.firstteam.team === teamtwo && i.secondteam.team === teamone)
      ) &&
      i.type === matchtype &&
      i.winner !== "";

    const matchFinished =
      user.matches.some(isSameMatch) ||
      user.knockouts.some(isSameMatch);

    return matchFinished;

  } catch (err) {
    console.error(err);
    return false;
  }
}
socket.on("join-pokemon-room",async(msg)=>{
let { name, team, player, matchID, matchtype, teamone, teamtwo } = msg;
player = player.map((i) => ({
  ...i,
  runs: 0,
  wickets: 0
}));
let assignedRoom = null;
for (const roomID in rooms) {
if (rooms[roomID].find(p => p.name === name)) {
socket.emit("pokemon-gaming-wait", "Already joined in another room...");
return;
}}
let check=await helper(teamone,teamtwo,matchtype,matchID)
if(check==true){
socket.emit("pokemon-gaming-wait", "Match already finished...");
return;
}
for (const roomID in rooms) {
if ( rooms[roomID].length < 2 && rooms[roomID].filter(i => (i.team === teamone || i.team === teamtwo) && i.matchID === matchID).length > 0){
assignedRoom = roomID;
break;
}}
if (!assignedRoom) {
assignedRoom = uuidv4();
rooms[assignedRoom] = [];
}
rooms[assignedRoom].push({ id: socket.id,name,choice: 0,team,player,matchID,matchtype});
socket.join(assignedRoom);
socket.roomId = assignedRoom;
if (rooms[assignedRoom].length === 1) {
io.to(assignedRoom).emit('pokemon-gaming-wait', 'Waiting for another player...');
  }
if (rooms[assignedRoom].length === 2) {
const players = rooms[assignedRoom];
turn[assignedRoom] = Math.floor(Math.random() * 2);
game[assignedRoom] = { innings: 1,
        scores: {
          [players[0].name]: 0,
          [players[1].name]: 0
        },
        wickets:{
         [players[0].name]: 0,
          [players[1].name]: 0
        },
        turn: players[Math.floor(Math.random() * 2)].name,
        target: -1,
        balls:0,
        batindex:0,
        ballindex:0,
        result: ""
      };
io.to(assignedRoom).emit('pokemon-gaming-start', {
        roomId: assignedRoom,
        players,
        game: game[assignedRoom]
      });
      io.to(players[turn[assignedRoom]].id).emit('pokemon-gaming-turn', "Your Turn");
      io.to(players[(turn[assignedRoom] + 1) % 2].id).emit('pokemon-gaming-turn', "Opposition Turn");
    //socket.roomId=assignedRoom
    }
})
socket.on("gaming-pokemon-move",async(msg)=>{
const roomId = socket.roomId; 
if (!roomId || !rooms[roomId]){
socket.to(roomId).emit("pokemon-gaming-wait", "A player has been disconnected...");
return;
} 
if (!game[roomId] || game[roomId].result) return;
const player = rooms[roomId].find(p => p.id === socket.id); 
if (!player){
socket.to(roomId).emit("pokemon-gaming-wait", "A player has been disconnected...");
return;
}
player.choice = msg.choice
let players = rooms[roomId];
if(players.find((p)=>p.choice == 0)==undefined){
  let [p1,p2]=players
  if(game[roomId].innings==1){
  const batter = players.find(p => p.name === game[roomId].turn);
const bowler = players.find(p => p.name !== game[roomId].turn);
    if(p1.choice != p2.choice){
  game[roomId].scores[batter.name]+=batter.choice
  rooms[roomId] = rooms[roomId].map((i) => {
  if (i.name === batter.name) {
    return {
      ...i,
      player: i.player.map((p, index) => {
        if (index === game[roomId].batindex) {
          return {
            ...p,
            runs: p.runs + batter.choice
          };
        }
        return p;
      })
    };
  }
  return i;
});
players=rooms[roomId]
  game[roomId].balls+=1
  if(game[roomId].balls%6 == 0 && game[roomId].ballindex < 4){
    game[roomId].ballindex+=1
  }
if(game[roomId].balls == 30 || game[roomId].wickets[batter.name] == 5){
  players.forEach((c)=>c.choice=0)
 game[roomId].target=game[roomId].scores[batter.name]+1
 game[roomId].turn=bowler.name
 game[roomId].batindex=0
 game[roomId].ballindex=0
 game[roomId].balls=0
 game[roomId].innings=2
 io.to(roomId).emit('pokemon-make-score', {
  players,
  game: game[roomId]
});
io.to(players[turn[roomId]].id).emit('pokemon-gaming-turn', "Your Turn");
io.to(players[(turn[roomId] + 1) % 2].id).emit('pokemon-gaming-turn', "Opposition Turn");
}
else{
  io.to(roomId).emit('pokemon-make-score', {
  players,
  game: game[roomId]
});
io.to(players[turn[roomId]].id).emit('pokemon-gaming-turn', "Your Turn");
io.to(players[(turn[roomId] + 1) % 2].id).emit('pokemon-gaming-turn', "Opposition Turn");
players.forEach((c)=>c.choice=0)
}
}
  else if(p1.choice == p2.choice){
  game[roomId].wickets[batter.name]+=1
  rooms[roomId] = rooms[roomId].map((i) => {
  if (i.name === bowler.name) {
    return {
      ...i,
      player: i.player.map((p, index) => {
        if (index === game[roomId].ballindex) {
          return {
            ...p,
            wickets:p.wickets+1
          };
        }
        return p;
      })
    };
  }
  return i;
});
players=rooms[roomId]
  game[roomId].balls+=1
  if(game[roomId].batindex < 4){
  game[roomId].batindex+=1
  }
  if(game[roomId].balls%6 == 0 && game[roomId].ballindex < 4 ){
    game[roomId].ballindex+=1
  }
if(game[roomId].balls == 30 || game[roomId].wickets[batter.name] == 5){
  players.forEach((c)=>c.choice=0)
  game[roomId].target=game[roomId].scores[batter.name]+1
  game[roomId].innings=2
 game[roomId].turn=bowler.name
 game[roomId].batindex=0
 game[roomId].ballindex=0
 game[roomId].balls=0
 io.to(roomId).emit('pokemon-make-score', {
  players,
  game: game[roomId]
});
io.to(players[turn[roomId]].id).emit('pokemon-gaming-turn', "Your Turn");
io.to(players[(turn[roomId] + 1) % 2].id).emit('pokemon-gaming-turn', "Opposition Turn");
}
else{
  io.to(roomId).emit('pokemon-make-score', {
  players,
  game: game[roomId]
});
io.to(players[turn[roomId]].id).emit('pokemon-gaming-turn', "Your Turn");
io.to(players[(turn[roomId] + 1) % 2].id).emit('pokemon-gaming-turn', "Opposition Turn");
players.forEach((c)=>c.choice=0)
}
  }
  }
 else if(game[roomId].innings==2){
const batter = players.find(p => p.name === game[roomId].turn);
const bowler = players.find(p => p.name !== game[roomId].turn);
if(p1.choice != p2.choice){
  game[roomId].scores[batter.name]+=batter.choice
  rooms[roomId] = rooms[roomId].map((i) => {
  if (i.name === batter.name) {
    return {
      ...i,
      player: i.player.map((p, index) => {
        if (index === game[roomId].batindex) {
          return {
            ...p,
            runs: p.runs + batter.choice
          };
        }
        return p;
      })
    };
  }
  return i;
});
players=rooms[roomId]
  game[roomId].balls+=1
  if(game[roomId].balls%6 == 0 && game[roomId].ballindex < 4){
    game[roomId].ballindex+=1
  }
if(game[roomId].balls<=30 && game[roomId].scores[batter.name] >= game[roomId].target){
  game[roomId].result=`${batter.name} is winner`
  let r=rooms[roomId]
  let g=game[roomId]
  io.to(roomId).emit('pokemon-make-score', {
  players,
  game: game[roomId]
});
await update_DB(batter,bowler,r,g)
delete rooms[roomId]
delete game[roomId]
delete turn[roomId]
io.in(roomId).socketsLeave(roomId);
}
else if(game[roomId].balls==30 && game[roomId].scores[batter.name] == game[roomId].target -1){
  game[roomId].result=`Match is Tied`
  io.to(roomId).emit('pokemon-make-score', {
  players,
  game: game[roomId]
});
delete rooms[roomId]
  delete game[roomId]
  delete turn[roomId]
  io.in(roomId).socketsLeave(roomId);
}
else if(game[roomId].balls==30 && game[roomId].scores[batter.name] < game[roomId].target-1){
  game[roomId].result=`${bowler.name} is winner`
  let r=rooms[roomId]
  let g=game[roomId]
  io.to(roomId).emit('pokemon-make-score', {
  players,
  game: game[roomId]
});
await update_DB(bowler,batter,r,g)
delete rooms[roomId]
delete game[roomId]
delete turn[roomId]
io.in(roomId).socketsLeave(roomId);
}
else{
  io.to(roomId).emit('pokemon-make-score', {
  players,
  game: game[roomId]
});
io.to(players[turn[roomId]].id).emit('pokemon-gaming-turn', "Your Turn");
io.to(players[(turn[roomId] + 1) % 2].id).emit('pokemon-gaming-turn', "Opposition Turn");
players.forEach((c)=>c.choice=0)
}
}
else if(p1.choice == p2.choice){
  game[roomId].wickets[batter.name]+=1
  rooms[roomId] = rooms[roomId].map((i) => {
  if (i.name === bowler.name) {
    return {
      ...i,
      player: i.player.map((p, index) => {
        if (index === game[roomId].ballindex) {
          return {
            ...p,
            wickets:p.wickets+1
          };
        }
        return p;
      })
    };
  }
  return i;
});
players=rooms[roomId]
  game[roomId].balls+=1
  if(game[roomId].batindex < 4){
  game[roomId].batindex+=1
  }
  if(game[roomId].balls%6 == 0 && game[roomId].ballindex < 4 ){
    game[roomId].ballindex+=1
  }
if(game[roomId].wickets[batter.name] == 5 && game[roomId].scores[batter.name] < game[roomId].target-1){
  game[roomId].result=`${bowler.name} is winner`
  let r=rooms[roomId]
  let g=game[roomId]
  io.to(roomId).emit('pokemon-make-score', {
  players,
  game: game[roomId]
});
await update_DB(bowler,batter,r,g)
delete rooms[roomId]
delete game[roomId]
delete turn[roomId]
io.in(roomId).socketsLeave(roomId);
}
else if(game[roomId].wickets[batter.name] == 5 && game[roomId].scores[batter.name] == game[roomId].target-1){
  game[roomId].result=`Match is Tied`
  io.to(roomId).emit('pokemon-make-score', {
  players,
  game: game[roomId]
});
delete rooms[roomId]
  delete game[roomId]
  delete turn[roomId]
  io.in(roomId).socketsLeave(roomId);
}
else if(game[roomId].wickets[batter.name] < 5 && game[roomId].balls==30 && game[roomId].scores[batter.name] < game[roomId].target-1){
  game[roomId].result=`${bowler.name} is winner`
  let r=rooms[roomId]
  let g=game[roomId]
  io.to(roomId).emit('pokemon-make-score', {
  players,
  game: game[roomId]
});
await update_DB(bowler,batter,r,g)
delete rooms[roomId]
delete game[roomId]
delete turn[roomId]
io.in(roomId).socketsLeave(roomId);
}
else if(game[roomId].wickets[batter.name] < 5 && game[roomId].balls==30 && game[roomId].scores[batter.name] == game[roomId].target-1){
 game[roomId].result=`Match is Tied`
  io.to(roomId).emit('pokemon-make-score', {
  players,
  game: game[roomId]
}); 
delete rooms[roomId]
  delete game[roomId]
  delete turn[roomId]
  io.in(roomId).socketsLeave(roomId);
}
else{
  io.to(roomId).emit('pokemon-make-score', {
  players,
  game: game[roomId]
});
io.to(players[turn[roomId]].id).emit('pokemon-gaming-turn', "Your Turn");
io.to(players[(turn[roomId] + 1) % 2].id).emit('pokemon-gaming-turn', "Opposition Turn");
players.forEach((c)=>c.choice=0)
}
}
 }
}
else{
  io.to(players[turn[roomId]].id).emit('pokemon-gaming-turn',"Opposition Turn")
     io.to(players[(turn[roomId]+1)%2].id).emit('pokemon-gaming-turn',"Your Turn")
}
})
socket.once('disconnect', () => {
  console.log("Player disconnected:", socket.id);
    for (const roomId in rooms) {
const index = rooms[roomId].findIndex(p => p.id === socket.id);
if (index !== -1) {
rooms[roomId].splice(index, 1);
if (rooms[roomId].length === 0) {
delete rooms[roomId];
} else {
socket.to(roomId).emit("pokemon-gaming-Left", "A player has been disconnected...");
}
break; // Stop loop after finding the room
}
    } // or just reuse logic
    console.log(rooms)
});
}