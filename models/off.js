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
  percent: {
    type: Number,
    required: true,
  },
});

const off = mongoose.model("offCode", offSchema);
module.exports = off;
