
const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    ratingsId: { type: mongoose.Schema.Types.ObjectId, ref: 'ratings'},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    content: String,
    upvote: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
    downvote: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
});

const Comment = mongoose.model('comments', commentSchema);

module.exports = Comment;

