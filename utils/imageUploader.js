const cloudinary = require("cloudinary").v2

exports.uploadImageToCloudinary = async (fetchedFile, cloudinaryFolderName, height, quality) => {
  const options = { 
    folder: cloudinaryFolderName,
    resource_type: "auto",
 }
  if (height) {
    options.height = height
  }
  if (quality) {
    options.quality = quality
  }
  console.log("OPTIONS", options)
  return await cloudinary.uploader.upload(fetchedFile.tempFilePath, options)
}