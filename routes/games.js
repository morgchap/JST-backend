var express = require('express');
var router = express.Router();
require('../models/connection');
const Game = require("../models/games")
const List = require("../models/lists")
const User = require('../models/users')


// get games from search bar
router.get("/fromsearch", async (req, res, next) => {
  const pattern = new RegExp(`^${req.query.search}`, "i");
  const gameData = await Game.find({ name: pattern }).lean();
  const games = gameData.sort();
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





router.post("/addToList", async (req, res) => {
  const { username, listName, gameName } = req.body

  // Check if the username is undefined
  if(!username){
    res.status(400).json({ result: false, error: "Missing username" })
    return
  }
  
  // Collecting the user id
  const user = await User.findOne({ username })
  if(!user){
    res.status(400).json({ result: false, error: "Username is not in the database" })
    return
  }
  const userId = user._id
  
  // Check if the listName is undefined
  if(!listName){
    res.status(400).json({ result: false, error: "Missing listName" })
    return
  }
  
  // Collecting the list id
  const list = await List.findOne({ user : userId, listName })
  if(!list){
    res.status(400).json({ result: false, error: "Your list is not in the database" })
    return
  }
  const listId = list._id

// Check if the game is in the database, if not save it in the database
let game = await Game.findOne({ name: gameName })
if(!game){
  res.status(400).json({ result: false, error: "Your game is not in the database" })
  return
}
const gameId = game._id
  
  // Check if the game is already in the list
  if(list.gameList.includes(gameId)){
    res.status(304).json({ result: false, error: "Your game is already in the list" })
    return
  }

  // add the game in the list
  await List.updateOne({ user: userId, listName }, { $addToSet: { gameList: gameId }})

  // add the game in "All my games" if it isn't already in the list
  await List.updateOne({ user: userId, listName: "All my games" }, { $addToSet: { gameList: gameId }})

  // add the list in the game's list's list
  await Game.updateOne({ _id: gameId }, { $addToSet: { lists: listId } } )

  res.status(200).json({ result: true, message: "Your game has been succesfuly added to your list" })
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
