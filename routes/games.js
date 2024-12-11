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


module.exports = router;
