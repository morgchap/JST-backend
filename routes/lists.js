var express = require('express');
var router = express.Router();
require('../models/connection');
const List = require("../models/lists")

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// create a list
router.post("/addList", async (req, res) => {
  try{
    const { listName, userId, isPublic } = req.body

    // check if the user enter a list name
    if(!listName || listName === ""){
      res.status(400).json({ result: false, error: "Missing name for the list" })
      return
    }
    // check if user is connected
    if(!userId){
      res.status(400).json({ result: false, error: "Missing user id, are you connected ?" })
      return
    }

    // if the user already have a list with this name, send an error
    List.find({ user: userId, listName }).then(data => {
      if(data.length !== 0){
console.log(data)
console.log(userId, listName)
        res.status(400).json({ result: false, error: "List already in the database" })
        return
      } else {
        const newList = new List({
          isPublic,
          listName,
          user: userId,
          gameList: [],
        })
    
        newList.save().then(data => {
          if(data){
            res.json({ result: true })
          } else {
            res.json({ result: false })
          }
        })
      }
    })


  } catch(error) { console.log(error) }
})


// route pour ajouter un jeux a la collection 'tout mes jeux' lorsque l'uitilisateur oimporte ses jeux a la création de son compte



module.exports = router;
