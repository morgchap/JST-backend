const mongoose = require("mongoose");

const ratingSchema = mongoose.Schema(
  {
    game: { type: mongoose.Schema.Types.ObjectId, ref: "games" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    writtenOpinion: String,
    note: Number,
    likesNumber: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    dislikesNumber: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    commentId: [{ type: mongoose.Schema.Types.ObjectId, ref: "comments" }],
  },
  { timestamps: true }
);

const Rating = mongoose.model("ratings", ratingSchema);

module.exports = Rating;
