const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: String,
    username : String,
    password : String,
    profilePicture: String,
    friendsList: [{ type: Schema.Types.ObjectId, ref: 'users'}],
    lists: [{ type: Schema.Types.ObjectId, ref: 'lists'}],
    ratingsID: [{ type: Schema.Types.ObjectId, ref: 'ratings'}],
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'users'}],
    token: String,

});

const User = mongoose.model('users', userSchema);

module.exports = User;