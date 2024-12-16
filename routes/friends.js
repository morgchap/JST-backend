var express = require('express');
var router = express.Router();
require('../models/connection');
const User = require('../models/users');
const Friend = require("../models/friends");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

//route d'ajout en ami d'un autre utilisateur

router.post("/addFriend", (req, res) => {

    Friend.findOne({sender: req.body.sender, receiver: req.body.receiver})
    .then(data => {
        if (data === null) {
            //res.json({result : true, message : "pas de demande en cours"})
            const newFriend = new Friend({
                sender: req.body.sender,
                receiver: req.body.receiver,
                status: "pending",
            

                
              });

              newFriend.save().then(() => {
                res.json({result:  true, message: "demande créée"})
              })

        } else {
            res.json({result : false, message : "une demande a déjà été réalisée", data: data})
        }
})
})

//route pour avoir toutes les demandes d'ami reçues

router.get("/receivedFriendRequests/:id", (req, res) => {

    Friend.find({receiver: new ObjectId(req.params), status: "pending"})
    .populate("sender")
    .then(data => {
        if (data) {
            res.json({result: true, data: data})
        } else {
            res.json({result: false, message: "friend request(s) not found" })
        }
        
    })
    .catch(err => res.status(500).json({ result: false, error: err.message }));
})

// route pour recevoir les demandes d'ami envoyées

router.get("/sentFriendRequests/:id", (req, res) => {

    Friend.find({sender: new ObjectId(req.params), status: "pending"})
    .populate("receiver")
    .then(data => {
        if (data) {
            res.json({result: true, data: data})
        } else {
            res.json({result: false, message: "friend request(s) not found" })
        }
        
    })
    .catch(err => res.status(500).json({ result: false, error: err.message }));
})


//route pour acceter un ami

router.put("/acceptFriendRequest", (req, res) => {

    Friend.updateOne({sender: req.body.sender, receiver: req.body.receiver}, {status: "accepted"})
    .then(() => {
        Friend.findOne({sender: req.body.sender, receiver: req.body.receiver})
        .then(data => {
            console.log(data);
            res.json({result: true, data: data})
        })
    }).catch(err => res.status(500).json({ result: false, error: err.message }));

})

module.exports = router;
