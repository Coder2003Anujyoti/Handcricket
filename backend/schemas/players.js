const mongoose=require('mongoose');
const playerSchema = new mongoose.Schema({
       id: {type:String},
       password:{type:String},
       contestants: {type:Array},
       news: {type:Array},
       matches: { type: Array },
       knockouts: { type: Array},
       teams: { type: Array},
       winner: {type:String},
       runnerup: {type:String},
       thirdplace: {type:String}
    });
    const PlayerCollection = mongoose.model("players",playerSchema);
module.exports=PlayerCollection;