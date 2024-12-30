const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: String,
  username: String,
  password: String,
  profilePicture: String,
  friendsList: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  lists: [{ type: mongoose.Schema.Types.ObjectId, ref: "lists" }],
  ratingsID: [{ type: mongoose.Schema.Types.ObjectId, ref: "ratings" }],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  token: String,
});

const User = mongoose.model("users", userSchema);

module.exports = User;
