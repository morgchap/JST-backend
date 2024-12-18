var express = require('express');
var router = express.Router();
require('../models/connection');
const Ratings = require('../models/ratings')
const User = require('../models/users');
const Game = require ('../models/games')
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;


// créer un nouvel avis 
router.post('/newreview', async (req, res) => {
 const Games = await Game.findOne({name : req.body.name}) 
 const Users = await User.findOne({username: req.body.username})

const newRatings = new Ratings({
  game : Games._id,
  user : Users._id,
  writtenOpinion: req.body.reviewcontent,
  note:req.body.note, 
})
const savedReview = await newRatings.save()

await User.updateOne({username : req.body.username}, {$push:{'ratingsID': savedReview._id}})

await Game.updateOne({name : req.body.name}, {$push:{'userOpinion': savedReview._id}})

res.json({result : true, ratings: savedReview})
})


// route get poour avoir les avis d'1 user
router.get('/byuser/:username', (req, res) => {

  User.findOne({username: req.params.username}).populate({
    path: 'ratingsID', // Populate the ratings
    populate: {
      path: 'game writtenOpinion', // Populate the 'game' field inside 'ratingsID'
    },
  }).then(data => {
    if (data){
      res.json({result : true, ratings: data.ratingsID})
    } else {
      res.json({result : false, error:'user not found'})
    }
  })

})


// route get pour avoir les avis d'1 jeux 
router.get('/bygame/:game', (req, res) => {

  Game.findOne({name: req.params.game}).populate('userOpinion').then(data => {
    if (data){
      console.log(data);
      
      res.json({result : true, ratings: data.userOpinion})
    }else {
      res.json({result : false, error:'game not found'})
    }
  })

})



// route post pour avoir les avis des amis d'un user 

router.post('/friendsreview', async (req, res) => {
  const { friendsList = [] } = await User.findOne({username: req.body.username}).select('friendsList').lean()
  
  const reviews = await Ratings.aggregate([
    {
      $match: {
        user: {
          $in: friendsList
        }
      }
    },
    {
      $lookup: {
        from: "games",
        localField: "game",
        foreignField: "_id",
        as: "game"
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user"
      }
    },
    {
      $project: {
        gameName: {
          $first: "$game.name"
        },
        gameCover: {
          $first: "$game.cover"
        },
        username: {
          $first: "$user.username"
        },
        profilePicture: {
          $first: "$user.profilePicture"
        },
        note: 1,
        writtenOpinion: 1,
        nbLikes: {
          $size: "$likesNumber"
        },
        nbDislikes: {
          $size: "$likesNumber"
        }
      }
    }
  ])

  res.json({result:true, ratings: reviews})
})

// route post pour avoir les avis des mes amis pour un jeu

router.post('/friendsreview/bygame', async (req, res) => {
  const { friendsList = [] } = await User.findOne({username: req.body.username}).select('friendsList').lean()
  const gameid = await Game.findOne({ name: req.body.name })
  //console.log(gameid)
  const reviews = await Ratings.aggregate(
    [
      {
        $match: {
          user: {
            $in: friendsList
          }
        }
      },
      {
        $match: {
          game: gameid._id
        }
      },
      {
        $lookup: {
          from: "games",
          localField: "game",
          foreignField: "_id",
          as: "game"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $project: {
          username: {
            $first: "$user.username"
          },
          profilePicture: {
            $first: "$user.profilePicture"
          },
          note: 1,
          writtenOpinion: 1,
          nbLikes: {
            $size: "$likesNumber"
          },
          nbDislikes: {
            $size: "$likesNumber"
          }
        }
      }
    ]
  )

  res.json({result:true, ratings: reviews})
})

//route pour liker une review et l'enregistrer en BDD

router.put("/likeAReview", (req, res) => {

  Ratings.updateOne({_id: new ObjectId(req.body.ratingId)}, {likesNumber: new ObjectId(req.body.userId)})
  .then(data => {

    if (data) {
    console.log(data);
    res.json({result: true, data: data})
    } else {
      res.json({result: false, message: "le nombre de like n'a pas pu être modifié"})
    }

  })

})

//recuperer tous les avis

router.get('/all', async (req, res) => {

  const reviews = await Ratings.aggregate([
       { $lookup: {
          from: "games",
          localField: "game",
          foreignField: "_id",
          as: "game"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $project: {
          gameName: {
            $first: "$game.name"
          },
          gameCover: {
            $first: "$game.cover"
          },
          username: {
            $first: "$user.username"
          },
          profilePicture: {
            $first: "$user.profilePicture"
          },
          note: 1,
          writtenOpinion: 1,
          nbLikes: {
            $size: "$likesNumber"
          },
          nbDislikes: {
            $size: "$likesNumber"
          }
        }
      }
    ]
  )

  res.json({result:true, ratings: reviews})
})




module.exports = router;
