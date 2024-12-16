var express = require('express');
var router = express.Router();
require('../models/connection');
const uniqid = require('uniqid');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const List = require("../models/lists")
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;


//route post pour s'inscrire (avec vérif par checkBody) + création d'une collection 'all my games' :

router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['username', 'password', 'email'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  // Check if the user has not already been registered
  User.findOne({ 
    $or: [
      { username : req.body.username },
      { email: req.body.email }
    ] 
    }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        email:req.body.email,
        username: req.body.username,
        password: hash,
        token: uid2(32),
        
      });
      newUser.save().then(userfound => {
        //res.json({ result: true, token: newDoc.token, username: newDoc.username });
        // création d'une nouvelle list
        const newList = new List({
          isPublic: false,
          listName: 'All my games',
          user: userfound._id,
        }); 
        newList.save().then(data=>{
          //res.json({ result: true, id: data._id });
          // ajout de cette nouvelle list au user 
          User.updateOne(
            { username: userfound.username }, 
            { 
              $push: { "lists": data._id } 
            }
          ).then(newDoc => {
            res.json({ result: true, lists: newDoc.lists, token: userfound.token, username: userfound.username})
        })
})
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
      res.json({ result: true, token: data.token, username: data.username });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});

// route get pour recuperer les infos du user 

router.get('/:user', (req, res) => {
  User.findOne({username : req.params.user}).then(data=>{
    if(data){
      res.json({result: true, infos: data})
    }
  })
})

// route post pour updater le username

router.post("/updateUsername", (req, res) => {

  User.updateOne({ username : req.body.currentUsername}, {username : req.body.newUsername})
  .then(() => {
    User.findOne({ username : req.body.newUsername })
    .then(data => {
      if (data) {
        res.json({result: true, updatedProfile: data})
      } else {
        res.json({ result: false, error: 'Update did not work' });
      }
    })
  } )

})

// route post pour updater l'email

router.post("/updateEmail", (req, res) => {

  User.updateOne({ email : req.body.currentEmail}, {email : req.body.newEmail})
  .then(() => {
    User.findOne({ email : req.body.newEmail })
    .then(data => {
      if (data) {
        res.json({result: true, updatedProfile: data})
      } else {
        res.json({ result: false, error: 'Update did not work' });
      }
    })
  } )

})

//route pour modifier le password

router.post("/updatePassword", (req, res) => {

  const hash = bcrypt.hashSync(req.body.newPassword, 10);

  User.updateOne({ username : req.body.username}, {password : hash})
  .then(() => {
    User.findOne({ username : req.body.username })
    .then(data => {
      if (data) {
        res.json({ result: true, message: 'Password updated' });
      } else {
        res.json({ result: false, error: 'Update did not work' });
      }
    })
  } )

})

// route pour updater la liste d'amis


router.put("/addFriend", (req, res) => {

  User.updateOne({username: req.body.username}, {$addToSet: {"friendsList": req.body.id}})
  .then(() => {
    User.findOne({username: req.body.username})
    .then(data => {
        console.log(data);
        res.json({result: true, data: data})
    })
}).catch(err => res.status(500).json({ result: false, error: err.message }));

})

//pour ajouter la photo de profil 

router.post("/updateAvatar", async (req, res) => {
  try {
    const photoPath = `./tmp/${uniqid()}.jpg`;

    // Ensure the file exists
    if (!req.files || !req.files.photoFromFront) {
      return res.json({ result: false, error: "No file uploaded." });
    }
    
    await req.files.photoFromFront.mv(photoPath);

    // Upload the file to Cloudinary
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);

    // Remove the file after uploading to Cloudinary
    fs.unlinkSync(photoPath);

    console.log(resultCloudinary.secure_url);

    // Update the user's profile picture
    const result = await User.updateOne(
      { username: req.body.username },
      { profilePicture: resultCloudinary.secure_url }
    );

    if (result.nModified > 0) {
      return res.json({ result: true, url: resultCloudinary.secure_url });
    } else {
      return res.json({ result: false, error: "User not found or update failed." });
    }
  } catch (err) {
    console.error(err);
    return res.json({ result: false, error: "An error occurred while updating the avatar." });
  }
});


// route pour rechercher un user
router.post("/search", async (req, res, next) => {
  const pattern = new RegExp(`^${req.query.search}`, "i");
  const userData = await User.find({ username: pattern }).lean();
  console.log(userData)
  //const games = gameData.sort();
  res.json({ data: gameData });
});



module.exports = router;
