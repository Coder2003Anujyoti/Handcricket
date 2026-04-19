const mongoose=require('mongoose');
const pokemonSchema = new mongoose.Schema({
       id: {type:String},
       password:{type:String},
       contestants: {type:Array},
       matches: { type: Array },
       knockouts: { type: Array},
       teams: { type: Array},
       winner: {type:String},
       runnerup: {type:String},
       thirdplace: {type:String},
       auctionStarted:{type:Boolean}
    });
    const PokemonCollection = mongoose.model("pokemons",pokemonSchema);
module.exports=PokemonCollection;