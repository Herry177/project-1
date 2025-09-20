const mongoose = require("mongoose");
const Review = require("./review.js");
const { string } = require("joi");

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: [
    {
      url: String,
      filname: String,
    },
  ],
  price: {
    type: Number,
  },
  location: {
    type: String,
  },
  country: {
    type: String,
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
  geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  category: {
    type: String,
    enum: [
      "Trending",
      "5-star",
      "Amazing pools",
      "Beach front",
      "Mountain cities",
      "Amazing views",
      "Farms",
      "Rooms",
      "Camping",
      "Castle",
      "Arctic",
      "Mountains",
      "Boats",
    ],
    required: true,
  },
  state: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "State",
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
