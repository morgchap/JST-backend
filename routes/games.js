var express = require('express');
var router = express.Router();
require('../models/connection');
const Game = require("../models/games")


// get games from search bar
router.get("/fromsearch", async (req, res, next) => {
  const pattern = new RegExp(`^${req.query.search}`, "i");
  const racesData = await Game.find({ name: pattern }).lean();
  const games = racesData.sort();
  res.json({ data: games });
});

// create a new game

router.get("/:games", async (req, res, next) => {
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
    game = await game.save();}
});



module.exports = router;
