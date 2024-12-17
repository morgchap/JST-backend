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

  User.findOne({username: req.params.username}).populate('ratingsID').then(data => {
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





module.exports = router;
