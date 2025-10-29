const { v4: uuidv4 } = require('uuid');
const crypto=require("crypto")
const rooms={}
const turn={}
const game={}
const UserCollection=require('../schemas/rooms');
module.exports=(io,socket)=>{
  socket.on('joinRoom', (msg) => {
    const name=msg.name
    const team=msg.team
    const player=msg.player
    const matchID=msg.matchID
    const matchtype=msg.matchtype
    const teamone=msg.teamone
    const teamtwo=msg.teamtwo
    let assignedRoom=null;
  for (const roomID in rooms) {
    const existingPlayer = rooms[roomID].find(p => p.name === name);
    if (existingPlayer) {
   socket.emit("wait", "Already joined in another room...");
      return;
    }
  }
    for(const roomID in rooms){
      if(rooms[roomID].length<2 && (rooms[roomID].filter((i)=> (i.team == teamone || i.team==teamtwo) && i.matchID == matchID).length > 0)){
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
      io.to(assignedRoom).emit('wait', 'Waiting for another player...');
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
      io.to(assignedRoom).emit('startGame', {
        roomId: assignedRoom,
        players,
        game:game[assignedRoom]
      });
       io.to(players[turn[assignedRoom]].id).emit('choiceturn',"Your Turn")
     io.to(players[(turn[assignedRoom]+1)%2].id).emit('choiceturn',"Opposition Turn")
    }
    socket.roomId = assignedRoom;
  })
socket.on('gomove', async(item) => { 
  const roomId = socket.roomId; 
if (!roomId || !rooms[roomId]){
  socket.to(roomId).emit("Left", "A player has been disconnected...");
  return;
} 
const player = rooms[roomId].find(p => p.id === socket.id); 
if (!player){
  socket.to(roomId).emit("Left", "A player has been disconnected...");
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
  io.to(roomId).emit('makescore', {
  players,
  game: game[roomId]
});
}
else{
  game[roomId].scores[batter.name] += batter.choice;
  game[roomId].result=`${batter.name} is winner`
    io.to(roomId).emit('makescore', {
  players,
  game: game[roomId]
})
try {
  const user = await UserCollection.findOne({ id: players[0].matchID });
  if (!user) return;
  let matches = [...user.matches];
  const nws=[...user.news]
const news=[`What a thriller between ${players[0].team.toUpperCase()} and ${players[1].team.toUpperCase()}!`,
    `A great knock from ${batter.name}, truly deserving the win!`,
  `Masterclass by ${batter.name} what a performance!`,`${batter.name}'s all-round brilliance lights up the game!`,
  `What a great clash between ${players[0].team.toUpperCase()} and ${players[1].team.toUpperCase()}!`,
`A high-voltage clash ends in favour of ${players.filter((i)=> i.name == batter.name)[0].team.toUpperCase()}!`]
    const match = matches.find(
      i =>
        ((i.firstteam.name === batter.name && i.secondteam.name === bowler.name) ||
        (i.firstteam.name === bowler.name && i.secondteam.name === batter.name)) && i.winner == ""
    );
    if ( match) {
       const ind=crypto.randomInt(0,news.length)
nws.pop()
nws.push({type:players[0].matchtype,content:news[ind],teamone:match.firstteam.team,teamtwo:match.secondteam.team,photo:players.filter((i)=> i.name == batter.name)[0].player})
      match.winner = batter.team;
      match.loser = bowler.team;
    }
  user.matches = matches;
  user.news=nws
user.markModified("news")
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
    io.to(players[turn[roomId]].id).emit('choiceturn',"Your Turn")
     io.to(players[(turn[roomId]+1)%2].id).emit('choiceturn',"Opposition Turn")
  }
  else{
    if(game[roomId].innings===1){
    const batter = players.find(p => p.name === game[roomId].turn);
    const bowler = players.find(p => p.name !== game[roomId].turn);
game[roomId].target=game[roomId].scores[batter.name]+1;
game[roomId].turn=bowler.name
game[roomId].innings=2;
      players.forEach((c)=>c.choice=0)
      io.to(roomId).emit('makescore', {
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
    io.to(roomId).emit('makescore', {
  players,
  game: game[roomId]
})
}
  else
  {
    game[roomId].result=`${bowler.name} is winner`
    io.to(roomId).emit('makescore', {
  players,
  game: game[roomId]
})
try {
  const user = await UserCollection.findOne({ id: players[0].matchID });
  if (!user) return;
  let matches = [...user.matches];
  const nws=[...user.news]
const news=[`What a thriller between ${players[0].team.toUpperCase()} and ${players[1].team.toUpperCase()}!`,
    `A great knock from ${bowler.name}, truly deserving the win!`,
  `Masterclass by ${bowler.name} what a performance!`,`${bowler.name}'s all-round brilliance lights up the game!`,
  `What a great clash between ${players[0].team.toUpperCase()} and ${players[1].team.toUpperCase()}!`,
`A high-voltage clash ends in favour of ${players.filter((i)=> i.name == bowler.name)[0].team.toUpperCase()}!`]
    const match = matches.find(
      i =>
        ((i.firstteam.name === batter.name && i.secondteam.name === bowler.name) ||
        (i.firstteam.name === bowler.name && i.secondteam.name === batter.name)) && i.winner == ""
    );
    if ( match) {
       const ind=crypto.randomInt(0,news.length)
nws.pop()
nws.push({type:players[0].matchtype,content:news[ind],teamone:match.firstteam.team,teamtwo:match.secondteam.team,photo:players.filter((i)=> i.name == bowler.name)[0].player})
      match.winner = bowler.team;
      match.loser = batter.team;
    }
  user.matches = matches;
  user.news=nws;
user.markModified("news")
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
          io.to(players[turn[roomId]].id).emit('choiceturn',"Your Turn")
     io.to(players[(turn[roomId]+1)%2].id).emit('choiceturn',"Opposition Turn")
  }
}
else{
  io.to(players[turn[roomId]].id).emit('choiceturn',"Opposition Turn")
     io.to(players[(turn[roomId]+1)%2].id).emit('choiceturn',"Your Turn")
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
          socket.to(roomId).emit("Left", "A player has been disconnected...");
        }
        break; // Stop loop after finding the room
      }
    } // or just reuse logic
    console.log(rooms)
});
}