
const mongoose = require('mongoose');

const gameSchema = mongoose.Schema({
    cover: String,
    name: String,
    summary: String,
    averageRating : Number,
    releaseDate: Date,
    genre: String,
    studio: String,
    userOpinion: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
    collection: [{ type: mongoose.Schema.Types.ObjectId, ref: 'lists'}],

});

const Game = mongoose.model('games', gameSchema);

module.exports = Game;

