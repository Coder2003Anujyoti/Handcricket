const express = require('express');
const router=express.Router();
const aliens=require("../data/Aliens.json");
router.get('/',(req, res) => {
      return res.json(aliens);
    });
router.get('/aliens', (req, res) => {
  const limit = parseInt(req.query.limit)||aliens.length; 
  const offset = parseInt(req.query.offset)||0;
if(isNaN(limit) && limit<=0){
  return res.status(400).json({error:"Limit must be a positive number."})
}
if(isNaN(offset) && offset<0){
  return res.status(400).json({error:"Offset must be a non-negative number."})
}
return res.json({
  data:aliens.slice(offset,offset+limit),
  length:aliens.length
  });
});
router.get('/api',async(req,res)=>{
  const text=req.query.name;
  const limit = parseInt(req.query.limit)||aliens.length; 
  const offset = parseInt(req.query.offset)||0;
if(isNaN(limit) && limit<=0){
  return res.status(400).json({error:"Limit must be a positive number."})
}
if(isNaN(offset) && offset<0){
  return res.status(400).json({error:"Offset must be a non-negative number."})
}
  const filteredItems = aliens.filter((item) => item.name.toLowerCase().includes(text.trim().toLowerCase()));
      
   return res.json({
     data:filteredItems.slice(offset,offset+limit),
     length:filteredItems.length
   });
  
})
module.exports=router;

