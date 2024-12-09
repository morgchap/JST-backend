const mongoose = require('mongoose');

const friendSchema = mongoose.Schema({
    sender: String,
    receiver : String,
    status : String,
    sendingDate: Date,
    approvingDate: Date,
    friendsList: [{ type: Schema.Types.ObjectId, ref: 'users'}],
    lists: [{ type: Schema.Types.ObjectId, ref: 'lists'}],
    ratingsID: [{ type: Schema.Types.ObjectId, ref: 'ratings'}],
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'users'}],
    token: String,

});

const Friend = mongoose.model('friends', friendSchema);

module.exports = Friend;