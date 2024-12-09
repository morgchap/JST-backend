

const mongoose = require('mongoose');

const friendSchema = mongoose.Schema({
    sender: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
    receiver : [{ type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
    status: String,
    sendingdate: Date,
    approvingdate: Date,


});

const Friend = mongoose.model('friends', friendSchema);

module.exports = Friend;

