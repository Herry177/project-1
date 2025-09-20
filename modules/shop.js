const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  
  category: {
    type: String,
    enum: ["Trending", "5-star", "Food", "Handicraft", "Clothing", "Other"],
  },

  image: [
    {
      url: String,
      filename: String,
    },
  ],

  location: String,

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

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Shop", shopSchema);
