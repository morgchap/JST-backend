const cloudinary = require("cloudinary").v2;
// we are stocking the pictures in cloudinary
const fs = require("fs");
const uniqid = require("uniqid");

// middleware used in the route that's uploading the profile picture
async function upload(req, res, next) {
  if (!req.files?.photoFromFront) {
    // if no file was received, next() means we are moving on to the next function who's being called
    return next();
  }
  // uniqid creates a unique id since we can't have the same name for multiple files
  const photoPath = `/tmp/${uniqid()}.jpg`;
  // .mv() is a method that move the picture to a temporary file (../tmp/.gitkeep) so we can use it later
  const resultMove = await req.files.photoFromFront.mv(photoPath);
  // method .mv() return 'undefined' if the the file was succesfully saved
  if (!resultMove) {
    //upload the picture to cloudinary
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    //remove the picture from the tmp file
    fs.unlinkSync(photoPath);
    // return the path to the picture so it can be used in the route
    req.files.cloudinary_url = resultCloudinary.secure_url;
    // move onto the next function
    return next();
  } else {
    return res.json({ result: false, error: resultMove });
  }
}

module.exports = { upload };
