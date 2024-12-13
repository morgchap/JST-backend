var express = require('express');
var router = express.Router();
require('../models/connection');
const Game = require("../models/games")
const List = require("../models/lists")
const User = require('../models/users')


// get games from search bar
router.get("/fromsearch", async (req, res, next) => {
  const pattern = new RegExp(`^${req.query.search}`, "i");
  const racesData = await Game.find({ name: pattern }).lean();
  const games = racesData.sort();
  res.json({ data: games });
});

// create a new game

router.post("/newgames", async (req, res, next) => {
 Game.findOne({ name: req.body.name }).then(data => {
  
 if(!data){
  const newGame = new Game({
    cover: req.body.img,
    name: req.body.name,
    summary: req.body.description,
    releaseDate: req.body.release,
    genre: req.body.genre,
    studio: req.body.studio,
  });
  newGame.save().then(newDoc => {
    res.json({result: true, gameid: newDoc._id})
  }
  )
   }else {
    res.json({result: false, error: 'game is already in the db'})
   }
  
  })
 }
)





router.post("/addToList/:username/:listName", async (req, res) => {
  const { cover, name, averageRating, summary, releaseDate, genre, studio } = req.body
  const { username, listName } = req.params
  
  // Check if the username is undefined
  if(!username){
    res.status(400).json({ result: false, error: "Missing username" })
    return
  }

  // Check if the listName is undefined
  if(!listName){
    res.status(400).json({ result: false, error: "Missing listName" })
    return
  }

  // Collecting the user id
  const user = await User.findOne({ username })
  if(!user){
    res.status(400).json({ result: false, error: "Username is not in the database" })
    return
  }
  const userId = user._id

  //collecting the list id
  const list = await List.findOne({ user : userId, listName })
  if(!list){
    res.status(400).json({ result: false, error: "Your list is not in the database" })
    return
  }
  const listId = list._id

  // Check if the game is in the database, if not save it in the database
  let game = await Game.findOne({ name })
  if(!game){
    const newGame = new Game({
      cover,
      listName,
      averageRating,
      summary,
      releaseDate,
      genre,
      studio,
      lists: listId, // Add to the game list
    });
    game = await newGame.save();
  } /* id de game trouvable dans game._id */

  List.updateOne({ user: userId, listName })
})


/// route to get a game by its name

router.post('/byname', (req, res) => {
  Game.findOne({ name: req.body.name }).then(data => {
    if (data) {
      res.json({result: true, game : data})
    } else {
      res.json({result: false, error : 'game not found'})
    }
  })
})


module.exports = router;
