const mongoose = require("mongoose");

const listSchema = mongoose.Schema({
  isPublic: Boolean,
  listName: String,
  //user: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  gameList: [{ type: mongoose.Schema.Types.ObjectId, ref: "games" }],
});

const List = mongoose.model("lists", listSchema);

module.exports = List;
