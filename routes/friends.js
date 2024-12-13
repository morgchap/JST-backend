var express = require('express');
var router = express.Router();
require('../models/connection');
const User = require('../models/users');
const Friend = require("../models/friends");

//route d'ajout en ami d'un autre utilisateur

router.post("/addFriend", (req, res) => {

    Friend.findOne({sender: req.body.sender, receiver: req.body.receiver})
    .then(data => {
        if (data === null) {
            //res.json({result : true, message : "pas de demande en cours"})
            const newFriend = new Friend({
                sender:req.body.sender,
                receiver: req.body.receiver,
                status: "pending",
                sendingdate: Date.now(),
                approvalDate: null
            

                
              });

              newFriend.save().then(() => {
                res.json({result:  true, message: "demande créée"})
              })

        } else {
            res.json({result : false, message : "une demande a déjà été réalisée"})
        }
})
})

module.exports = router;
