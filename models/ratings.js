
const mongoose = require('mongoose');

const ratingSchema = mongoose.Schema({
    game: [{ type: Schema.Types.ObjectId, ref: 'games'}],
    user: [{ type: Schema.Types.ObjectId, ref: 'users'}],
    writtenOpinion: String,
    note: Number,
    likesNumber: [{ type: Schema.Types.ObjectId, ref: 'users'}],
    dislikesNumber: [{ type: Schema.Types.ObjectId, ref: 'users'}],
    ratingId : [{ type: Schema.Types.ObjectId, ref: 'comments'}],
    commentDate: Date,

});

const Rating = mongoose.model('ratings', ratingSchema);

module.exports = Rating;

