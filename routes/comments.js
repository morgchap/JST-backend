var express = require("express");
var router = express.Router();
require("../models/connection");
const Comment = require("../models/comment");
const User = require("../models/users");
const Rating = require("../models/ratings");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

//create a new comment and push its id to the ratings collection

router.post("/newCom", async (req, res) => {
  //get the user id
  const userId = await User.findOne({ username: req.body.username });
  // create a new comment
  const newCom = await new Comment({
    ratingsId: req.body.ratings,
    userId: userId._id,
    content: req.body.content,
  });
  // save the new comment
  const result = await newCom.save();
  // update the ratings and push the new comment id in the commentId fields
  await Rating.updateOne(
    { _id: req.body.ratings },
    // addToSet check for duplicate
    { $addToSet: { commentId: result._id } }
  );

  res.json({ result: true, comment: result });
});

// get comment from ratings id

router.get("/byratings/:ratings", async (req, res) => {
  // using aggregation to get only the information relevant for use
  const result = await Rating.aggregate([
    {
      //in the Ratings collection, we are lookoing for document that contains the ratings id
      $match: {
        _id: new ObjectId(req.params.ratings),
      },
    },
    {
      // in the document that match the first filter, we deconstruct the array in the field 'commentID' an replace each id by the entire document that matches the id
      $unwind: {
        path: "$commentId",
      },
    },
    {
      // get info from the commentId
      $lookup: {
        from: "comments",
        localField: "commentId",
        foreignField: "_id",
        as: "comment",
      },
    },
    {
      //get info from the userId fields within the comment that we just lookup
      $lookup: {
        from: "users",
        localField: "comment.userId",
        foreignField: "_id",
        as: "commentor",
      },
    },
    {
      // we return the following info
      $project: {
        content: {
          $first: "$comment.content",
        },
        username: {
          $first: "$commentor.username",
        },
        profilePic: {
          $first: "$commentor.profilePicture",
        },
      },
    },
  ]);

  res.json({ result: true, comment: result });
});

module.exports = router;
