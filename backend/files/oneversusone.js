const express= require('express');
const users=require("../data/Rooms.json")
const router = express.Router();
const UserCollection= require('../schemas/rooms.js');
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
let teams=["Mi","Csk","Kkr","Dc","Gt","Lsg","Rr","Srh","Pbks","Rcb"]
router.post("/add-series-room",async(req,res)=>{
const {id,password}=req.body;
try{
const user=await UserCollection.findOne({id})
if(user){
 return res.json({message:"Room already added",type:"error"})
}
const newUser = new UserCollection({id,password,contestants: [],matches: [],knockouts: [],teams: [], winner: "",
 runnerup: "",thirdplace: ""});
    await newUser.save();
    return res.json({ message: "Room added successfully",type:"success"});
}
catch(err){
 console.log(err)
 return res.json({message: "Server error"})
}
})
router.post("/add-series-contestant",async(req,res)=>{
const {name,id}= req.body
try{
const user = await UserCollection.findOne({id})
if(!user){
return res.json({message:"Room not found",type:"error"})
}  
else if(user.contestants.length == 2 && user.contestants.find((i)=> i.name == name) == undefined)
{
 return res.json({message:"Room is full",type:"error"})
}
else if(user.contestants.length < 2 && user.contestants.find((i)=> i.name == name) !== undefined)
{
 return res.json({message:"Waiting for others",type:"success"})
}
else if(user.contestants.length == 2 && user.contestants.find((i)=> i.name == name) !== undefined)
{
 return res.json(user)
}
else{
if(user.contestants.length==0){
  let random_number=Math.floor(Math.random()*9)
   let team = teams.slice(random_number,random_number+2)
   user.teams.push(...team)
    user.contestants.push({slot:user.contestants.length+1,name,team:team[user.contestants.length]});
  }
  else{
    user.contestants.push({slot:user.contestants.length+1,name,team:user.teams[user.contestants.length]})
  }
  if(user.contestants.length==2){
  const matchone={
    firstteam:user.contestants[0],
    secondteam:user.contestants[1],
    winner:"",
    loser:""
  }
  let arr=[matchone,matchone,matchone]
  user.matches.push(...arr)
  }
 res.json(user);
 console.log(user)
 user.save().then(() => console.log(`User ${id} updated successfully.`))
 .catch(err => console.error(`Failed to save user ${id}:`, err));
}
}
catch(err){
console.log(err)
return res.json({message: "Server error"})
}
})
router.post("/delete-series-room", async (req, res) => {
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