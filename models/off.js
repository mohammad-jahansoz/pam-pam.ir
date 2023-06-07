const mongoose = require("mongoose");

const offSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  count: {
    type: Number,
    required: true,
  },
});

const off = mongoose.model("off", offSchema);
module.exports = off;
