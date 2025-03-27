const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  comment: {
    type: String,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updated_at: {
    type: Date,   
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

module.exports = mongoose.model("Review", reviewSchema);

