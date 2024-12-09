var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

//route post pour s'inscrire (avec vérif par checkBody) :

router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['username', 'password', 'email'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  // Check if the user has not already been registered
  User.findOne({ 
    $or: [
      { user : req.body.email },
      { email: req.body.username }
    ] 
    }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        email:req.body.email,
        firsname: req.body.firstname,
        username: req.body.username,
        password: hash,
        token: uid2(32),
        
      });

      newUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token, firstname: newDoc.firsname });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: 'User or email already exists' });
    }
  });
});

//route post sigin pour se log (avec vérif par CheckBody) :

router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ username: req.body.username }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token, firstname: data.firsname });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});


module.exports = router;
