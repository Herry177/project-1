const Place = require("../modules/place.js");
const State = require("../modules/state.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const map_Token = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: map_Token });

// INDEX ROUTE - ALL PLACES
module.exports.index = async (req, res) => {
  const allStates = await State.find({});
  let filter = {};
  if (req.query.state) {
    filter.state = req.query.state;
  }

  const allPlaces = await Place.find(filter).populate("state");
  res.render("places/index.ejs", { allPlaces, allStates, selectedState: req.query.state || "" });
};

// NEW PLACE FORM
module.exports.renderNewForm = async (req, res) => {
  const states = await State.find({});
  res.render("places/new.ejs", { states });
};

// CREATE ROUTE
module.exports.createPlace = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    req.flash("error", "Please upload at least one image");
    return res.redirect("/places/new");
  }

  // Geocoding for coordinates
  const geoData = await geocodingClient.forwardGeocode({
    query: `${req.body.place.location} ${req.body.place.country}`,
    limit: 1
  }).send();
  const coordinate = geoData.body.features[0].geometry;

  const newPlace = new Place(req.body.place);
  newPlace.owner = req.user._id;
  newPlace.geometry = coordinate;

  for (let file of req.files) {
    newPlace.image.push({ url: file.path, filename: file.filename });
  }

  await newPlace.save();
  req.flash("success", "New place created!");
  res.redirect("/places");
};

// EDIT FORM
module.exports.editPlace = async (req, res) => {
  const { id } = req.params;
  const place = await Place.findById(id).populate("state");
  if (!place) {
    req.flash("error", "Place not found");
    return res.redirect("/places");
  }

  const states = await State.find({});
  const originalImageUrl = place.image[0]?.url?.replace("/upload", "/upload/h_150,w_250");
  res.render("places/edit.ejs", { place, states, originalImageUrl });
};

// UPDATE ROUTE
module.exports.updatePlace = async (req, res) => {
  const { id } = req.params;
  const place = await Place.findByIdAndUpdate(id, { ...req.body.place }, { new: true });

  // Re-geocode if location or country changes
  if (req.body.place.location || req.body.place.country) {
    const geoData = await geocodingClient.forwardGeocode({
      query: `${req.body.place.location} ${req.body.place.country}`,
      limit: 1
    }).send();
    place.geometry = geoData.body.features[0].geometry;
    await place.save();
  }

  if (req.files && req.files.length > 0) {
    for (let file of req.files) {
      place.image.push({ url: file.path, filename: file.filename });
    }
    await place.save();
  }

  req.flash("success", "Place updated!");
  res.redirect(`/places/${id}`);
};

// DELETE ROUTE
module.exports.deletePlace = async (req, res) => {
  const { id } = req.params;
  await Place.findByIdAndDelete(id);
  req.flash("success", "Place deleted!");
  res.redirect("/places");
};

// SHOW ROUTE
module.exports.showPlace = async (req, res) => {
  const { id } = req.params;
  const place = await Place.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner")
    .populate("state");

  if (!place) {
    req.flash("error", "Place not found");
    return res.redirect("/places");
  }

  let sum = 0, count = 0;
  for (review of place.reviews) { sum += review.rating; count++; }
  sum = place.reviews.length > 0 ? sum / place.reviews.length : 0;

  res.render("places/show.ejs", { place, sum, count });
};

// YOUR LISTED PLACES
module.exports.seeYoursPlaces = async (req, res) => {
  const { curruserid } = req.params;
  const places = await Place.find({ owner: curruserid }).populate("state");
  if (places.length > 0) {
    return res.render("places/your_places.ejs", { places });
  }
  req.flash("error", "You haven't added any places!");
  res.redirect("/places");
};

// CATEGORY ROUTE
module.exports.category = async (req, res) => {
  const { name } = req.params;
  const places = await Place.find({ type: name }).populate("state");
  if (places.length > 0) {
    return res.render("places/category.ejs", { places, name });
  }
  req.flash("error", "No listings match this category!");
  res.redirect("/places");
};
