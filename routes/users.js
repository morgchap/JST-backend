var express = require("express");
var router = express.Router();
require("../models/connection");
const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const List = require("../models/lists");
const mongoose = require("mongoose");
const { upload } = require("../modules/cloudinary");
const ObjectId = mongoose.Types.ObjectId;

//route post pour s'inscrire (avec vérif par checkBody) + création d'une collection 'all my games' :

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["username", "password", "email"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  // Check if the user has not already been registered
  User.findOne({
    $or: [{ username: req.body.username }, { email: req.body.email }],
  }).then((data) => {
    // if user does not already exist
    if (data === null) {
      //encrypt the user's password
      const hash = bcrypt.hashSync(req.body.password, 10);
      //create new user
      const newUser = new User({
        email: req.body.email,
        username: req.body.username,
        password: hash,
        //generate a unique token with 32 characters using uid2
        token: uid2(32),
      });
      //save new user
      newUser.save().then((userfound) => {
        // create the default list
        const newList = new List({
          isPublic: false,
          listName: "All my games",
          user: userfound._id,
        });
        newList.save().then((data) => {
          // link the list to the user using the $push method from mongoose
          User.updateOne(
            { username: userfound.username },
            {
              $push: { lists: data._id },
            }
          ).then((newDoc) => {
            //return the relevant fields for easier handling in the front
            res.json({
              result: true,
              lists: newDoc.lists,
              token: userfound.token,
              username: userfound.username,
              userId: data._id,
            });
          });
        });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: "User or email already exists" });
    }
  });
});

//route post sigin pour se log (avec vérif par CheckBody) :

router.post("/signin", (req, res) => {
  //if check Body return false
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    // we don't need to read the rest of the route we can stop here.
    return;
  }
  //check if username exist and if password is ok
  User.findOne({ username: req.body.username }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({
        result: true,
        token: data.token,
        username: data.username,
        userId: data._id,
      });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
});

// route get pour recuperer les infos du user

router.get("/getOne/:user", (req, res) => {
  User.findOne({ username: req.params.user })
    .populate("friendsList")
    .then((data) => {
      if (data) {
        res.json({ result: true, infos: data });
      }
    });
});

// route get qui recupere la liste des amies

router.get("/getFriendList/:user", (req, res) => {
  User.findOne({ username: req.params.user }).then((data) => {
    if (data) {
      res.json({ result: true, list: data });
    } else {
      res.json({ result: true, list: [] });
    }
  });
});

// route post pour updater le username

router.post("/updateUsername", (req, res) => {
  User.updateOne(
    { username: req.body.currentUsername },
    { username: req.body.newUsername }
  ).then(() => {
    User.findOne({ username: req.body.newUsername }).then((data) => {
      if (data) {
        res.json({ result: true, updatedProfile: data });
      } else {
        res.json({ result: false, error: "Update did not work" });
      }
    });
  });
});

// route post pour updater l'email

router.post("/updateEmail", (req, res) => {
  User.updateOne(
    { email: req.body.currentEmail },
    { email: req.body.newEmail }
  ).then(() => {
    User.findOne({ email: req.body.newEmail }).then((data) => {
      if (data) {
        res.json({ result: true, updatedProfile: data });
      } else {
        res.json({ result: false, error: "Update did not work" });
      }
    });
  });
});

//route pour modifier le password

router.post("/updatePassword", (req, res) => {
  const hash = bcrypt.hashSync(req.body.newPassword, 10);

  User.updateOne({ username: req.body.username }, { password: hash }).then(
    () => {
      User.findOne({ username: req.body.username }).then((data) => {
        if (data) {
          res.json({ result: true, message: "Password updated" });
        } else {
          res.json({ result: false, error: "Update did not work" });
        }
      });
    }
  );
});

// route pour updater la liste d'amis

router.put("/addFriend", (req, res) => {
  // push l'id du friend dans la liste d'amis du user
  User.updateOne(
    { username: req.body.username },
    { $addToSet: { friendsList: req.body.id } }
  )
    .then(() => {
      User.findOne({ username: req.body.username }).then((data) => {
        console.log(data);
        res.json({ result: true, data: data });
      });
    })
    .catch((err) =>
      res.status(500).json({ result: false, error: err.message })
    );
});

//pour ajouter la photo de profil
// calling th upload function from the modules
router.post("/updateAvatar", upload, async (req, res, next) => {
  try {
    // Vérifier que les données nécessaires sont présentes
    if (!req.body.username || !req.files || !req.files.cloudinary_url) {
      return res.status(400).json({
        result: false,
        error: "Missing required fields: username or profile picture",
      });
    }

    // Mettre à jour l'utilisateur
    const updateResult = await User.updateOne(
      { username: req.body.username },
      { profilePicture: req.files.cloudinary_url }
    );

    // Vérifier si l'utilisateur a été trouvé et mis à jour
    if (updateResult.nModified === 0) {
      return res.status(404).json({
        result: false,
        error: "User not found or no changes made",
      });
    }

    // Réponse en cas de succès
    res.json({ result: true, profilePicture: req.files.cloudinary_url });
  } catch (error) {
    console.error("Error in /updateAvatar route:", error);
    res.status(500).json({
      result: false,
      error: "An internal server error occurred",
    });
  }
});

// route pour rechercher un user
router.get("/search", async (req, res, next) => {
  // regex qui retourne ce que le user cherche dans la barre de recherche
  const pattern = new RegExp(`^${req.query.search}`, "i");
  // using lean() method for faster loading
  const userData = await User.find({ username: pattern }).lean();
  // sort result
  const games = userData.sort();
  res.json({ data: games });
});

// route pour avoir tous les user

router.get("/getall", (req, res) => {
  User.find().then((response) => {
    res.json({ response: true, result: response });
  });
});

module.exports = router;
