const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  place_name: {
    type: String,
    required: true,
  },

  title: {
    type: String,
  },

  description: {
    type: String,
  },

  image: [
    {
      url: String,
      filename: String,
    },
  ],
  country: {
    type: String,
  },
  
  location: {
    type: String,
  },

  state: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "State",
    required: true,
  },

  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

  type: {
    type: String,
    enum: [
      "Trending",
      "5-star",
      "Cultural",
      "Adventure",
      "Historical",
      "Religious",
      "Nature",
    ],
    required: true,
  },

  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      // required: true,
    },
    coordinates: {
      type: [Number],
      // required: true,
    },
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Place", placeSchema);
