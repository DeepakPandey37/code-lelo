const cloudinary = require('cloudinary').v2;

exports.cloudinaryUpload = async (file, folder, height, quality) => {
  const options = { folder }; // Ensure options is an object
  if (height) {
    options.height = height;
  }
  if (quality) {
    options.quality = quality;
  }

  options.resource_type = "auto";

  return await cloudinary.uploader.upload(file.tempFilePath, options);
};
