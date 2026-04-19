const express= require('express');
const users=require("../data/Pokemons.json")
const router = express.Router();
const UserCollection= require('../schemas/poke.js');
   const addDataToMongodb = async() => {
    try {
    await UserCollection.deleteMany()
    await UserCollection.insertMany(users)
    console.log("✅ Data inserted successfully");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  }
}
//addDataToMongodb();
let teams=["Yoddhas","Titans","Giants","Thalaivas"]
router.post("/add-pokemon-room",async(req,res)=>{
const {id,password}=req.body;
try{
const user=await UserCollection.findOne({id})
if(user){
 return res.json({message:"Room already added",type:"error"})
}
const newUser = new UserCollection({id,password,contestants: [],matches: [],knockouts: [],teams: [], winner: "",
 runnerup: "",thirdplace: "",auctionStarted:false});
    await newUser.save();
    return res.json({ message: "Room added successfully",type:"success"});
}
catch(err){
 console.log(err)
 return res.json({message: "Server error"})
}
})
router.post("/join-pokemon-room",async(req,res)=>{
const {name,id}= req.body
try{
const user = await UserCollection.findOne({id})
if(!user){
return res.json({message:"Room not found",type:"error"})
}  
else if(user.contestants.length == 4 && user.contestants.find((i)=> i.name == name) == undefined)
{
 return res.json({message:"Room is full",type:"error"})
}
else if(user.contestants.length < 4 && user.contestants.find((i)=> i.name == name) !== undefined)
{
 return res.json({message:"Waiting for others",type:"success"})
}
else if(user.contestants.length == 4 && user.contestants.find((i)=> i.name == name) !== undefined)
{
 return res.json(user)
}
else{
if(user.contestants.length==0){
   let team = teams
   user.teams.push(...team)
    user.contestants.push({slot:user.contestants.length+1,name,team:team[user.contestants.length],matches:0,win:0,lose:0,nrr:0.00,players:[]});
  }
  else{
    user.contestants.push({slot:user.contestants.length+1,name,team:user.teams[user.contestants.length],matches:0,win:0,lose:0,nrr:0.00,players:[]})
  }
  if(user.contestants.length==4){
   const matchone={
    firstteam:user.contestants[0],
    secondteam:user.contestants[3],
    type:"Match 1",
    winner:"",
    loser:""
  }
  const matchtwo={
    firstteam:user.contestants[1],
    secondteam:user.contestants[2],
    type:"Match 2",
    winner:"",
    loser:""
  }
  const matchthree={
    firstteam:user.contestants[0],
    secondteam:user.contestants[2],
    type:"Match 3",
    winner:"",
    loser:""
  }
  const matchfour={
    firstteam:user.contestants[1],
    secondteam:user.contestants[3],
    type:"Match 4",
    winner:"",
    loser:""
  }
  const matchfive={
    firstteam:user.contestants[0],
    secondteam:user.contestants[1],
    type:"Match 5",
    winner:"",
    loser:""
  }
  const matchsix={
    firstteam:user.contestants[2],
    secondteam:user.contestants[3],
    type:"Match 6",
    winner:"",
    loser:""
  }
  let arr=[matchone,matchtwo,matchthree,matchfour,matchfive,matchsix]
  user.knockouts.push(...arr)
  }
console.log(user);

try {
  await user.save();
  console.log(`User ${id} updated successfully.`);
  res.json(user);
} catch (err) {
  console.error(`Failed to save user ${id}:`, err);
  res.status(500).json({ error: "Failed to save user" });
}
}
}
catch(err){
console.log(err)
return res.json({message: "Server error"})
}
})
router.post("/delete-pokemon-room", async (req, res) => {
  const { id, password } = req.body;
  try {
    const user = await UserCollection.findOne({ id });
    if (!user) return res.json({ message: "Room not found" , type:"error"});
    if (password && user.password !== password) {
      return res.json({ message: "Invalid password",type:"error" });
    }
    await UserCollection.deleteOne({ id });
    return res.json({ message: "Room deleted successfully",type:"success" });
  } catch (err) {
    console.log(err);
    return res.json({ message: "Server error" });
  }
});

module.exports=router;