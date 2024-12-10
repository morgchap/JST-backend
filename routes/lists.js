var express = require('express');
var router = express.Router();
require('../models/connection');
const List = require("../models/lists")

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// create a list
router.post("/addList", (req, res) => {
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
            res.json({ result: true })
          } else {
            res.json({ result: false })
          }
        })
      }
    })
  } catch(error) { console.log(error) }
})

// get all the lists of a user
router.get("/:idUser", (req, res) => {
  try{
    const { idUser } = req.params

    // check if idUser is undefined
    if(!idUser){
      res.status(400).json({ result: false, error: "idUser is undefined" })
      return
    }

    List.find({ user: idUser }).then(data => {
      if(data.length === 0){
        // if the user don't have any list
        res.status(400).json({ result: false, error: "You don't have any list in the database" })
        return
      } else {
        // if everything is fine, send all the user's list
        res.json({ result: true, lists: data })
      }
    })
  } catch(error) { console.log(error) }
})

module.exports = router;
