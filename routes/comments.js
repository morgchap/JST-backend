var express = require('express');
var router = express.Router();
require('../models/connection');
const Comment = require ('../models/comment')
const User = require('../models/users')
const Rating = require ('../models/ratings')
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;


//une route pour créer un commentaire (LOU)

router.post('/newCom', async (req, res)=> {
    const userId = await User.findOne({username: req.body.username})
    //console.log(userId._id)
    const newCom = await new Comment({
        ratingsId: req.body.ratings,
        userId: userId._id,
        content: req.body.content, 
    })

    const result = await newCom.save()

 await Rating.updateOne(
        {_id: req.body.ratings}, 
        {$addToSet: {"commentId": result._id}}
    )

    res.json({result: true, comment:result})

})

// une route pour recupere les commentaire d'un avis (Nicolas)

router.get('/byratings/:ratings', async (req, res) => {
    //console.log(req.params.ratings)
    const result = await Rating.aggregate(
            [
                {
                  $match: {
                    _id: new ObjectId(req.params.ratings)
                  }
                },
                {
                  $unwind: {
                    path: "$commentId"
                  }
                },
                {
                  $lookup: {
                    from: "comments",
                    localField: "commentId",
                    foreignField: "_id",
                    as: "comment"
                  }
                },
                {
                  $lookup: {
                    from: "users",
                    localField: "comment.userId",
                    foreignField: "_id",
                    as: "commentor"
                  }
                },
                {
                  $project: {
                    content: {
                      $first: "$comment.content"
                    },
                    username: {
                      $first: "$commentor.username"
                    },
                    profilePic: {
                      $first: "$commentor.profilePicture"
                    }
                  }
                }
              ]
    )

    res.json({result: true, comment: result})
})


// une route delete (jeremy)

// une post route pour ajouter un like (Morgane)

// une route pour recuperer les commentaires d'un user

module.exports = router;

