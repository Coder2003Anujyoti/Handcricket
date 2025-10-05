const mongoose=require('mongoose');
const roomsSchema = new mongoose.Schema({
       id: {type:String},
       password:{type:String},
       contestants: {type:Array},
       matches: { type: Array },
       knockouts: { type: Array},
       teams: { type: Array},
       winner: {type:String},
       runnerup: {type:String},
       thirdplace: {type:String}
    });
    const RoomsCollection = mongoose.model("rooms",roomsSchema);
module.exports=RoomsCollection;