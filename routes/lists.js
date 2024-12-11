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
      
      // if the user already have a list with this name, send an error
      List.find({ user: userId, listName }).then(data => {
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
      
          newList.save().then(data => {
            if(data){
              res.json({ result: true, list: data })
            } else {
              res.json({ result: false })
            }
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


<<<<<<< HEAD
// route pour ajouter un jeux a la collection 'tout mes jeux' lorsque l'utilisateur importe ses jeux a la création de son compte

router.post("/allgames", (req, res) => {
  try{
    User.findOne({username : req.body.username}).then(userinfo=> {
      if(!userinfo){
    // check if idUser is undefined
      res.status(400).json({ result: false, error: "user is undefined" })
      return

      } else {
        let userId = userinfo._id
        List.findOne({ user: userId, listName: 'All my games' }).then(result => {
console.log(result)
        // if everything is fine, create a new document in the game database,
        const newGame = new Game ({
          cover: req.body.img,
          name: req.body.name, 
          summary: req.body.description,
          releaseDate: req.body.release,
          genre: req.body.genre,
          studio: req.body.studio,
              lists:result._id
        })
        newGame.save().then(data=>{
  
          // ajout d'un jeu a la liste all games 
              List.updateOne({ user: userId, listName: 'All my games' }, { $push: { "gameList": data._id } }
          ).then(newDoc => {
            res.json({ result: true, games: data.games})
        })
    })
    }
    )
      } 
    })
      }catch(error) { console.log(error) }
})


// delete the list
router.delete("/:listName", (req, res) => {
  try{
    const { listName } = req.params

    if(!listName){
      res.status(400).json({ result: false, error: "There is no list with that name." })
      return
    }

    List.deleteOne({ listName }).then(data => {
      if(data === 0){
        res.status(417).json({ result: false, error: "Deletion failed" })
        return
      }
      res.json({ result: true })
    })
  } catch(error) { console.log(error) }
})
=======
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
>>>>>>> f077c63f022dac42b03f41f5697b10c7c9e5fb2e


module.exports = router;
