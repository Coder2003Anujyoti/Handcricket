const { v4: uuidv4 } = require('uuid');
const crypto=require("crypto")
const rooms={}
const turn={}
const game={}
const UserCollection=require('../schemas/users');
module.exports=(io,socket)=>{
  socket.on('dualjoinRoom', (msg) => {
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
   socket.emit("dualwait", "Already joined in another room...");
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
      io.to(assignedRoom).emit('dualwait', 'Waiting for another player...');
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
      io.to(assignedRoom).emit('dualstartGame', {
        roomId: assignedRoom,
        players,
        game:game[assignedRoom]
      });
       io.to(players[turn[assignedRoom]].id).emit('dualchoiceturn',"Your Turn")
     io.to(players[(turn[assignedRoom]+1)%2].id).emit('dualchoiceturn',"Opposition Turn")
    }
    socket.roomId = assignedRoom;
  })
socket.on('dualgomove', async(item) => { 
  const roomId = socket.roomId; 
if (!roomId || !rooms[roomId]){
  socket.to(roomId).emit("dualLeft", "A player has been disconnected...");
  return;
} 
const player = rooms[roomId].find(p => p.id === socket.id); 
if (!player){
  socket.to(roomId).emit("dualLeft", "A player has been disconnected...");
return;
}
player.choice = item;
const players = rooms[roomId];
if(players.find((p) =>p.choice==0)==undefined){
  const [p1,p2]=players
  if(p1.choice!==p2.choice){
    const batter = players.find(p => p.name === game[roomId].turn);
  if(game[roomId].target==-1 || game[roomId].target> (game[roomId].scores[batter.name]+batter.choice)){
   game[roomId].scores[batter.name] += batter.choice;
  io.to(roomId).emit('dualmakescore', {
  players,
  game: game[roomId]
});
}
else{
  game[roomId].scores[batter.name] += batter.choice;
  game[roomId].result=`${batter.name} is winner`
    io.to(roomId).emit('dualmakescore', {
  players,
  game: game[roomId]
})
try{
const user= await UserCollection.findOne({id:players[0].matchID})
if(!user){
  return;
}
const nws=[...user.news]
const news=[`What a thriller between ${players[0].team.toUpperCase()} and ${players[1].team.toUpperCase()}!`,
    `A great knock from ${batter.name}, truly deserving the win!`,
  `Masterclass by ${batter.name} what a performance!`,`${batter.name}'s all-round brilliance lights up the game!`,
  `What a great clash between ${players[0].team.toUpperCase()} and ${players[1].team.toUpperCase()}!`,
`A high-voltage clash ends in favour of ${players.filter((i)=> i.name == batter.name)[0].team.toUpperCase()}!`]
if(user.matches.filter((i)=> i.winner == "").length >0){
user.matches=user.matches.map((i)=>{
  if((i.firstteam.name == batter.name || i.secondteam.name== batter.name) && i.winner===""){
const ind=crypto.randomInt(0,news.length)
nws.pop()
nws.push({type:players[0].matchtype,content:news[ind],teamone:i.firstteam.team,teamtwo:i.secondteam.team,photo:players.filter((i)=> i.name == batter.name)[0].player})
    return({
      ...i,
    winner:(i.firstteam.name == batter.name) ? i.firstteam.team : i.secondteam.team,
   loser:(i.firstteam.name != batter.name) ? i.firstteam.team : i.secondteam.team
    })
  }
  return {...i}
})
console.log(user)
}
else{
  if(user.matches.filter((i)=>i.winner ==batter.team).length > 0 && user.winner == ""){
const ind=crypto.randomInt(0,news.length)
nws.pop()
nws.push({type:players[0].matchtype,content:news[ind],teamone:user.matches[0].winner,teamtwo:user.matches[1].winner,photo:players.filter((i)=> i.name == batter.name)[0].player})
    user.winner=batter.team;
    user.runnerup= players.filter((i)=> i.team != batter.team)[0].team
  }
  else if(user.matches.filter((i)=>i.loser ==batter.team).length > 0 && user.thirdplace == "")
  { const ind=crypto.randomInt(0,news.length)
nws.pop()
nws.push({type:players[0].matchtype,content:news[ind],teamone:user.matches[0].loser,teamtwo:user.matches[1].loser,photo:players.filter((i)=> i.name == batter.name)[0].player})
    user.thirdplace=batter.team;
  }
}
user.news=nws
user.markModified("news")
user.markModified("matches");
await user.save()
 io.emit("updatedknock",{user})
}
catch(err){
 console.log(err)
}
delete rooms[roomId]
  delete game[roomId]
  delete turn[roomId]
  io.in(roomId).socketsLeave(roomId);
  return;
}
  players.forEach((c)=>c.choice=0)
    io.to(players[turn[roomId]].id).emit('dualchoiceturn',"Your Turn")
     io.to(players[(turn[roomId]+1)%2].id).emit('dualchoiceturn',"Opposition Turn")
  }
  else{
    if(game[roomId].innings===1){
    const batter = players.find(p => p.name === game[roomId].turn);
    const bowler = players.find(p => p.name !== game[roomId].turn);
game[roomId].target=game[roomId].scores[batter.name]+1;
game[roomId].turn=bowler.name
game[roomId].innings=2;
      players.forEach((c)=>c.choice=0)
      io.to(roomId).emit('dualmakescore', {
  players,
  game: game[roomId]
});
}
else{
  const batter = players.find(p => p.name === game[roomId].turn);
  const bowler = players.find(p => p.name !== game[roomId].turn);
  if(game[roomId].scores[bowler.name]==game[roomId].scores[batter.name]){
    game[roomId].result='Match is tied'
    io.to(roomId).emit('dualmakescore', {
  players,
  game: game[roomId]
})
}
  else
  {
    game[roomId].result=`${bowler.name} is winner`
    io.to(roomId).emit('dualmakescore', {
  players,
  game: game[roomId]
})
try{
const user= await UserCollection.findOne({id:players[0].matchID})
if(!user){
  return;
}
const nws=[...user.news]
const news=[`What a thriller between ${players[0].team.toUpperCase()} and ${players[1].team.toUpperCase()}!`,
    `A great knock from ${bowler.name}, truly deserving the win!`,
  `Masterclass by ${bowler.name} what a performance!`,`${bowler.name}'s all-round brilliance lights up the game!`,
  `What a great clash between ${players[0].team.toUpperCase()} and ${players[1].team.toUpperCase()}!`,
`A high-voltage clash ends in favour of ${players.filter((i)=> i.name == bowler.name)[0].team.toUpperCase()}!`]
if(user.matches.filter((i)=> i.winner == "").length >0){
user.matches=user.matches.map((i)=>{
  if((i.firstteam.name == bowler.name || i.secondteam.name== bowler.name) && i.winner == ""){
const ind=crypto.randomInt(0,news.length)
nws.pop()
nws.push({type:players[0].matchtype,content:news[ind],teamone:i.firstteam.team,teamtwo:i.secondteam.team,photo:players.filter((i)=> i.name == bowler.name)[0].player})
 return({...i,winner:(i.firstteam.name == bowler.name) ? i.firstteam.team : i.secondteam.team
   ,loser:(i.firstteam.name != bowler.name) ? i.firstteam.team : i.secondteam.team})
  }
  return {...i}
})
}
else{
  if(user.matches.filter((i)=>i.winner ==bowler.team).length > 0 && user.winner == ""){
  const ind=crypto.randomInt(0,news.length)
nws.pop()
nws.push({type:players[0].matchtype,content:news[ind],teamone:user.matches[0].winner,teamtwo:user.matches[1].winner,photo:players.filter((i)=> i.name == bowler.name)[0].player})
    user.winner=bowler.team;
    user.runnerup= players.filter((i)=> i.team != bowler.team)[0].team
    
  }
  else if(user.matches.filter((i)=>i.loser ==bowler.team).length > 0 && user.thirdplace == "")
  {
    const ind=crypto.randomInt(0,news.length)
nws.pop()
nws.push({type:players[0].matchtype,content:news[ind],teamone:user.matches[0].loser,teamtwo:user.matches[1].loser,photo:players.filter((i)=> i.name == bowler.name)[0].player})
    user.thirdplace=bowler.team;
    
  }
}
user.news=nws
user.markModified("news")
user.markModified("matches");
await user.save()
 io.emit("updatedknock",{user})
}
catch(err){
console.log(err)
}
}
  delete rooms[roomId]
  delete game[roomId]
  delete turn[roomId]
  io.in(roomId).socketsLeave(roomId);
  return;
}
          io.to(players[turn[roomId]].id).emit('dualchoiceturn',"Your Turn")
     io.to(players[(turn[roomId]+1)%2].id).emit('dualchoiceturn',"Opposition Turn")
  }
}
else{
  io.to(players[turn[roomId]].id).emit('dualchoiceturn',"Opposition Turn")
     io.to(players[(turn[roomId]+1)%2].id).emit('dualchoiceturn',"Your Turn")
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
          socket.to(roomId).emit("dualLeft", "A player has been disconnected...");
        }
        break; // Stop loop after finding the room
      }
    } // or just reuse logic
    console.log(rooms)
});
}