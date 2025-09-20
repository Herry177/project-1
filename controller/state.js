const State = require("../modules/state.js");
const Listing = require("../modules/listing.js");
const Place = require("../modules/place.js");
const Shop = require("../modules/shop.js");

// INDEX - LIST ALL STATES
module.exports.index = async (req, res) => {
  const allStates = await State.find({});
  res.render("states/index.ejs", { allStates });
};

// SHOW - SHOW DETAILS OF A STATE WITH LINKED LISTINGS, PLACES, SHOPS
module.exports.showState = async (req, res) => {
  const { id } = req.params;

  // Find the state
  const state = await State.findById(id);
  if (!state) {
    req.flash("error", "State not found");
    return res.redirect("/states");
  }

  // Find all listings, places, shops in this state
  const listings = await Listing.find({ state: state._id }).populate("owner");
  const places = await Place.find({ state: state._id }).populate("owner");
  const shops = await Shop.find({ state: state._id }).populate("owner");

  res.render("states/show.ejs", { state, listings, places, shops });
};
