const mongoose=require('mongoose');
const userSchema = new mongoose.Schema({
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
    const UserCollection = mongoose.model("users",userSchema);
module.exports=UserCollection;