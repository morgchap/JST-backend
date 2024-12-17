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



// route get pour avoir les avis des amis d'un user 

router.post('/friendsreview', async (req, res) => {
  const Users = await User.findOne({username: req.body.username}).populate('friendsList')
  const Friend = await Users.friendsList.populate('ratingsID')
  res.json({result:true, ratings: Friend})

})

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
    return res.status(500).json({ result: false, message: "Erreur serveur", error: err.message });
  }
});





module.exports = router;
