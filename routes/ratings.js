var express = require('express');
var router = express.Router();
require('../models/connection');
const Ratings = require('../models/ratings')
const User = require('../models/users');
const Game = require ('../models/games')


// créer un nouvelle avis 
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



// route post pour avoir les avis des amis d'un user 

router.post('/friendsreview', async (req, res) => {
  const Users = await User.findOne({username: req.body.username}).populate('friendsList')
  //const Friend = await Users.friendsList.populate('ratingsID')
  let reviews = []
  for (let data of Users.friendsList){
   let result = await data.populate('ratingsID')
   //console.log(result.ratingsID)
    reviews.push(result.ratingsID)
  }

  res.json({result:true, ratings: reviews})
})

// route post pour avoir les avis des mes amis pour un jeu

router.post('/friendsreview/bygame', async (req, res) => {
  const Users = await User.findOne({username: req.body.username}).populate('friendsList')
  const Games = await Game.findOne({name: req.body.gameName})
  console.log(Games)
  //const Friend = await Users.friendsList.populate('ratingsID')
  let reviews = []
  for (let friend of Users.friendsList){
    await friend.populate({
      path: 'ratingsID',
      populate: { path: 'game', model: 'games' }, // Populate the 'game' field inside 'ratingsID'
    });
    const friendRatings = friend.ratingsID.filter(
      (rating) => rating.game && rating.game._id.toString() === Games._id.toString()
    );

    if (friendRatings.length > 0) {
      reviews.push({
        friendUsername: friend.username,
        ratings: friendRatings,
      });
    }
  }


  res.json({result:true, ratings: reviews})
})


module.exports = router;
