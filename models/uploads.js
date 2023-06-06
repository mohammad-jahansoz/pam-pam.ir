const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
  url: String,
  type: String,
});

const Upload = mongoose.model("Upload", uploadSchema);

module.exports = Upload;
