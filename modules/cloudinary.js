const cloudinary = require("cloudinary").v2
const fs = require("fs")
const uniqid = require("uniqid")

async function upload(req, res, next) {
  if (!req.files?.photoFromFront) {
    return next()
  }
  const photoPath = `./tmp/${uniqid()}.jpg`
  const resultMove = await req.files.photoFromFront.mv(photoPath)
  if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(photoPath)
    fs.unlinkSync(photoPath)
    req.files.cloudinary_url = resultCloudinary.secure_url
    return next()
  } else {
    return res.json({ result: false, error: resultMove })
  }
}

module.exports = { upload }