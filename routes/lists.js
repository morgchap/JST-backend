var express = require('express');
var router = express.Router();
require('../models/connection');
const List = require("../models/lists")
const Game = require("../models/games")
const User = require('../models/users')

/* GET users listing. */
/*router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});*/

// create a list
router.post("/addList", (req, res) => {
  try{
    const { listName, username, isPublic } = req.body

    // check if the user enter a list name
    if(!listName || listName === ""){
      res.status(400).json({ result: false, error: "Missing name for the list" })
      return
    }

    User.findOne({ username }).then(data => {

      const userId = data._id

      // check if user is connected
      if(!userId){
        res.status(400).json({ result: false, error: "Missing user id, are you connected ?" })
        return
      }
      
      List.find({ user: userId, listName }).then( async (data) => {
        if(data.length !== 0){
          // if the user already have a list with this name, send an error
          res.status(400).json({ result: false, error: "List already in the database" })
          return
        } else {
          // if everything is fine, save the newlist in the database
          const newList = new List({
            isPublic,
            listName,
            user: userId,
            gameList: [],
          })

          // add the list in the database
          await newList.save().then(data => {
            if(data){
              res.json({ result: true, list: data })
            } else {
              res.json({ result: false })
            }
          })

          // add the list in the user's database
          await List.findOne({ listName, user: userId }).then(data => {
            User.updateOne({ _id: userId }, { $push: { lists: data._id } })
              .then(data => console.log(data))
          })

        }
      })
    })
  } catch(error) { console.log(error) }
})


// get all the lists of a user
router.get("/:username", (req, res) => {
  try{
    const { username } = req.params

    // check if idUser is undefined
    if(!username){
      res.status(400).json({ result: false, error: "username is undefined" })
      return
    }

    // you need to fetch in the user collection to get the id of the user
    User.findOne({ username }).then(data => {
      // check if username is undefined
      if(!data){
        res.status(400).json({ result: false, error: "Didn't find the user in the database" })
        return
      }
      List.find({ user: data._id }).then(data => {
        if(data.length === 0){
          // if the user don't have any list
          res.status(400).json({ result: false, error: "You don't have any list in the database" })
          return
        } else {
          // if everything is fine, send all the user's list
          res.json({ result: true, lists: data })
        }
      })
    })

  } catch(error) { console.log(error) }
})


// route pour ajouter un jeux a la collection 'tout mes jeux' lorsque l'uitilisateur oimporte ses jeux a la création de son compte

router.post("/allgames", async (req, res) => {
  try {
    const userinfo = await User.findOne({ username: req.body.username });

    if (!userinfo) {
      return res.status(400).json({ result: false, error: "user is undefined" });
    }

    const userId = userinfo._id;

    const list = await List.findOne({ user: userId, listName: 'All my games' });

    if (!list) {
      return res.status(400).json({ result: false, error: "User's game list not found" });
    }

    // Check if the game is already in the database
    const gameresult = await Game.findOne({ name: req.body.name });

    let game;
    if (!gameresult) {
      // Create a new game if it doesn't exist
      game = new Game({
        cover: req.body.img,
        name: req.body.name,
        summary: req.body.description,
        releaseDate: req.body.release,
        genre: req.body.genre,
        studio: req.body.studio,
        lists: list._id, // Add to the game list
      });

      // Save the new game
      game = await game.save();
    } else {
      game = gameresult; // Use the existing game
    }

    // Add the game to the user's 'All my games' list
    await List.updateOne(
      { user: userId, listName: 'All my games' },
      { $push: { gameList: game._id } }
    );

    res.json({ result: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: "Something went wrong" });
  }
});



// delete the list
router.delete("/:listName/:username", async (req, res) => {
  try{
    const { listName, username } = req.params

    // check if listName is undefined
    if(!listName){
      res.status(400).json({ result: false, error: "There is no list with that name." })
      return
    }
    // check if username is undefined
    if(!username){
      res.status(400).json({ result: false, error: "There is no username with that name." })
      return
    }

    const user = await User.findOne({ username });
    const list = await List.findOne({ user: user._id, listName })
    // delete the list from the user collection (user.lists)
    await User.updateOne({ _id: user._id }, { $pull: {lists: list._id} })
    
    // delete the list from the List collection
    await List.deleteOne({ _id: list._id })

    res.json({ result: true })

  } catch(error) { console.log(error) }
})

// route get pour chopper une liste par son id

router.get("/id/:id", (req, res) => {

  const { id } = req.params
  
  List.findById(id)
  .populate('gameList')
  .then(data => {
    if (data) {
      res.json({result: true, data: data});
      console.log(data);
    } else {
      res.json({ result: false, error: 'no lists found' });
    }
    
  })
});


router.get("/getGames/:listName/:username", async (req, res) => {
  //console.log(req.params)
  const { listName, username } = req.params
  //const listName = "nul"
  //const username = "jojo"
  let listName2 = listName.replaceAll("_", " ")
  const user = await User.findOne({ username });
  const list = await List.findOne({ user: user._id, listName: listName2 })
  //console.log(user, listName2)

  if(!list){
    res.status(400).json({ result: false, error: "There is no list with that name for this username." })
    return
  }

  if(list.gameList.length === 0){
    res.status(200).json({ result: false, error: "Your list is empty." })
    return
  }

  let gamesInfo = []
  for(let gameId of list.gameList){
    let tmpGame = await Game.findById(gameId)
    gamesInfo.push([tmpGame.name, tmpGame.cover])
  }
  res.json({ result: true, list: gamesInfo })
})


module.exports = router;
