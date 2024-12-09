const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: String,
    username : String,
    password : String,
    profilePicture: String,
    friendsList: [String],
    

});

const User = mongoose.model('users', userSchema);

module.exports = User;