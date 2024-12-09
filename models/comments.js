
const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    ratingsId: [{ type: Schema.Types.ObjectId, ref: 'ratings'}],
    userId: [{ type: Schema.Types.ObjectId, ref: 'users'}],
    content: String,
    upvote: [{ type: Schema.Types.ObjectId, ref: 'users'}],
    downvote: [{ type: Schema.Types.ObjectId, ref: 'users'}],
});

const Comment = mongoose.model('comments', commentSchema);

module.exports = Comment;

