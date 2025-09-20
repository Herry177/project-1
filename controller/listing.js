const Listing = require("../modules/listing.js");
const State = require("../modules/state.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const map_Token = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: map_Token });

// INDEX / HOME ROUTE
module.exports.index = async (req, res) => {
  const allStates = await State.find({}); // fetch all states
  let filter = {};
  if (req.query.state) {
    filter.state = req.query.state; // filter by state id
  }

  const allListings = await Listing.find(filter).populate("state");
  res.render("listing/index.ejs", { allListings, allStates, selectedState: req.query.state || "" });
};

// SEARCH ROUTE
module.exports.search = async (req, res, next) => {
  let { search } = req.query;

  if (!isNaN(search)) {
    search = Number(search);
    let listings = await Listing.find({ price: search })
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner")
      .populate("state");
    if (!listings || listings.length === 0) {
      req.flash("error", "The requested listings doesn't exist or has been deleted");
      return res.redirect("/listings");
    }

    if (listings.length > 1) return res.render("listing/search2.ejs", { listings });
    
    let sum = 0, count = 0;
    for (review of listings[0].reviews) { sum += review.rating; count++; }
    sum = listings[0].reviews.length > 0 ? sum / listings[0].reviews.length : 0;
    res.render("listing/search.ejs", { listing: listings[0], sum, count });
  } else {
    let listings = await Listing.find({
      $or: [
        { title: search },
        { description: search },
        { location: search },
        { country: search }
      ]
    }).populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner")
      .populate("state");

    if (!listings || listings.length === 0) {
      req.flash("error", "The requested listings doesn't exist or has been deleted");
      return res.redirect("/listings");
    }

    if (listings.length > 1) return res.render("listing/search2.ejs", { listings });
    
    let sum = 0, count = 0;
    for (review of listings[0].reviews) { sum += review.rating; count++; }
    sum = listings[0].reviews.length > 0 ? sum / listings[0].reviews.length : 0;
    res.render("listing/search.ejs", { listing: listings[0], sum, count });
  }
};

// NEW ROUTE
module.exports.renderNewForm = async (req, res) => {
  const states = await State.find({});
  res.render("listing/new.ejs", { states });
};

// CREATE ROUTE
module.exports.createListing = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    req.flash("error", "Please upload at least one image");
    return res.redirect("/listings/new");
  }

  const geoData = await geocodingClient.forwardGeocode({
    query: `${req.body.listing.location} ${req.body.listing.country}`,
    limit: 1
  }).send();
  const coordinate = geoData.body.features[0].geometry;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.geometry = coordinate;
  
  for (let file of req.files) {
    newListing.image.push({ url: file.path, filename: file.filename });
  }

  await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect(`/listings`);
};

// EDIT ROUTE
module.exports.editListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("state");
  if (!listing) {
    req.flash("error", "The requested listing doesn't exist or has been deleted");
    return res.redirect("/listings");
  }

  const states = await State.find({});
  const originalImageUrl = listing.image[0]?.url?.replace("/upload", "/upload/h_150,w_250");
  res.render("listing/edit.ejs", { listing, states, originalImageUrl });
};

// UPDATE ROUTE
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

  if (req.files && req.files.length > 0) {
    for (let file of req.files) {
      listing.image.push({ url: file.path, filename: file.filename });
    }
    await listing.save();
  }

  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

// DELETE ROUTE
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};

// SHOW ROUTE
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner")
    .populate("state");

  if (!listing) {
    req.flash("error", "The requested listing doesn't exist or has been deleted");
    return res.redirect("/listings");
  }

  let sum = 0, count = 0;
  for (review of listing.reviews) { sum += review.rating; count++; }
  sum = listing.reviews.length > 0 ? sum / listing.reviews.length : 0;

  res.render("listing/show.ejs", { listing, sum, count });
};

// SEE YOUR LISTINGS
module.exports.seeYoursListings = async (req, res) => {
  const { curruserid } = req.params;
  const listings = await Listing.find({ owner: curruserid }).populate("state");
  if (listings.length > 0) {
    return res.render("listing/your_listings.ejs", { listings });
  }
  req.flash("error", "You haven't created any listings!");
  res.redirect("/listings");
};

// CATEGORY ROUTE
module.exports.category = async (req, res) => {
  const { name } = req.params;
  const listings = await Listing.find({ category: name }).populate("state");
  if (listings.length > 0) {
    return res.render("listing/category.ejs", { listings, name });
  }
  req.flash("error", "No listings match this category!");
  res.redirect("/listings");
};

// PRIVACY / TERMS
module.exports.privacyPolicy = (req, res) => res.render("privacy/privacy.ejs");
module.exports.terms = (req, res) => res.render("privacy/terms.ejs");
