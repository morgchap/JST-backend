

const mongoose = require('mongoose');

const friendSchema = mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    receiver : { type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    status: String,
    timestamps: Boolean,
    
});

const Friend = mongoose.model('friends', friendSchema);

module.exports = Friend;

