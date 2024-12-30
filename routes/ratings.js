var express = require("express");
var router = express.Router();
require("../models/connection");
const Ratings = require("../models/ratings");
const User = require("../models/users");
const Game = require("../models/games");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

// créer un nouvel avis et le pusher dans les collection User et Game
router.post("/newreview", async (req, res) => {
  // get the gameId from its name
  const Games = await Game.findOne({ name: req.body.name });
  // get the userId from its username
  const Users = await User.findOne({ username: req.body.username });
  //create new ratings
  const newRatings = new Ratings({
    game: Games._id,
    user: Users._id,
    writtenOpinion: req.body.reviewcontent,
    note: req.body.note,
  });
  //save the rating
  const savedReview = await newRatings.save();
  //push the ratings id in the ratingsId fields in the User collection
  await User.updateOne(
    { username: req.body.username },
    { $push: { ratingsID: savedReview._id } }
  );
  //push the ratings id in the userOpinion fields in the Game collection
  await Game.updateOne(
    { name: req.body.name },
    { $push: { userOpinion: savedReview._id } }
  );

  res.json({ result: true, ratings: savedReview });
});

// route get pour avoir les avis d'1 user
router.get("/byuser/:username", (req, res) => {
  User.findOne({ username: req.params.username })
    .populate({
      path: "ratingsID", // Populate the ratings
      populate: {
        path: "game writtenOpinion", // Populate the 'game' field inside 'ratingsID'
      },
    })
    .then((data) => {
      if (data) {
        res.json({ result: true, ratings: data });
      } else {
        res.json({ result: false, error: "user not found" });
      }
    });
});

// route get pour avoir les avis d'1 jeux
router.get("/bygame/:game", (req, res) => {
  Game.findOne({ name: req.params.game })
    .populate("userOpinion")
    .then((data) => {
      if (data) {
        console.log(data);

        res.json({ result: true, ratings: data.userOpinion });
      } else {
        res.json({ result: false, error: "game not found" });
      }
    });
});

// route post pour avoir les avis des amis d'un user

router.post("/friendsreview", async (req, res) => {
  const { friendsList = [] } = await User.findOne({
    username: req.body.username,
  })
    .select("friendsList")
    .lean();

  const reviews = await Ratings.aggregate([
    {
      $match: {
        user: {
          $in: friendsList,
        },
      },
    },
    {
      $lookup: {
        from: "games",
        localField: "game",
        foreignField: "_id",
        as: "game",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $project: {
        gameName: {
          $first: "$game.name",
        },
        gameCover: {
          $first: "$game.cover",
        },
        username: {
          $first: "$user.username",
        },
        profilePicture: {
          $first: "$user.profilePicture",
        },
        note: 1,
        writtenOpinion: 1,
        nbLikes: {
          $size: "$likesNumber",
        },
        likesCounter: {
          $ifNull: ["$likesNumber", []],
        },
      },
    },
  ]);

  res.json({ result: true, ratings: reviews });
});

// route post pour avoir les avis des mes amis pour un jeu

router.post("/friendsreview/bygame", async (req, res) => {
  const { friendsList = [] } = await User.findOne({
    username: req.body.username,
  })
    .select("friendsList")
    .lean();
  const gameid = await Game.findOne({ name: req.body.name });
  //console.log(gameid)
  const reviews = await Ratings.aggregate([
    {
      $match: {
        user: {
          $in: friendsList,
        },
      },
    },
    {
      $match: {
        game: gameid._id,
      },
    },
    {
      $lookup: {
        from: "games",
        localField: "game",
        foreignField: "_id",
        as: "game",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $project: {
        username: {
          $first: "$user.username",
        },
        profilePicture: {
          $first: "$user.profilePicture",
        },
        note: 1,
        writtenOpinion: 1,
        likesCounter: {
          $ifNull: ["$likesNumber", []],
        },
        nbLikes: {
          $size: "$likesNumber",
        },
      },
    },
  ]);

  res.json({ result: true, ratings: reviews });
});

//route pour liker une review et l'enregistrer en BDD

router.put("/likeOrDislikeAReview", async (req, res) => {
  try {
    // Vérifiez si la note existe et si l'utilisateur a déjà liké
    const rating = await Ratings.findOne({
      _id: new ObjectId(req.body.ratingId),
      likesNumber: { $elemMatch: { $eq: req.body.userId } }, // Vérifie si userId est déjà dans likesNumber
    });

    if (rating) {
      // Si l'utilisateur a déjà liké, retirez le like
      const result = await Ratings.updateOne(
        { _id: new ObjectId(req.body.ratingId) },
        { $pull: { likesNumber: req.body.userId } }
      );
      return res.json({ result: true, message: "Like retiré", data: result });
    } else {
      // Si l'utilisateur n'a pas encore liké, ajoutez le like
      const result = await Ratings.updateOne(
        { _id: new ObjectId(req.body.ratingId) },
        { $addToSet: { likesNumber: req.body.userId } }
      );
      return res.json({ result: true, message: "Like ajouté", data: result });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ result: false, message: "Erreur serveur", error: err.message });
  }
});

//recuperer tous les avis

router.get("/all", async (req, res) => {
  //using the aggregate method to only get the relevent fields
  const reviews = await Ratings.aggregate([
    {
      // get infos from the games field in ratings collection
      $lookup: {
        from: "games",
        localField: "game",
        foreignField: "_id",
        as: "game",
      },
    },
    {
      // get infos from the user in the ratings collection
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      //return these specifics fiels
      $project: {
        gameName: {
          $first: "$game.name",
        },
        gameCover: {
          $first: "$game.cover",
        },
        username: {
          $first: "$user.username",
        },
        profilePicture: {
          $first: "$user.profilePicture",
        },
        note: 1,
        writtenOpinion: 1,
        nbLikes: {
          $first: "$game.likesNumber",
        },
        likesCounter: {
          $ifNull: ["$likesNumber", []],
        },
      },
    },
  ]);

  res.json({ result: true, ratings: reviews });
});

module.exports = router;
