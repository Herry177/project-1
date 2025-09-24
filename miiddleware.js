const Listing = require("./modules/listing.js");
const Place = require("./modules/place.js");
const Shop = require("./modules/shop.js");
const Review = require("./modules/review.js");
const { listingSchema } = require("./schema.js");
const { placeSchema } = require("./schema.js");
const { localShopSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in for Trippeo");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveredirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// --- NEW MIDDLEWARE ---
module.exports.isVerified = (req, res, next) => {
  if (req.isAuthenticated() && !req.user.isVerified) {
    req.flash("error", "Please verify your email to access this page.");
    return res.redirect("/verify");
  }
  next();
};

module.exports.isUserListing = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have permission to make updates.");
    return res.redirect(`/listings/${listing._id}`);
  }
  next();
};

module.exports.isUserPlace = async (req, res, next) => {
  let { id } = req.params;
  let place = await Place.findById(id);
  if (!place.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have permission to make updates.");
    return res.redirect(`/places/${place._id}`);
  }
  next();
};

module.exports.isUserLocalShop = async (req, res, next) => {
  let { id } = req.params;
  let shop = await Shop.findById(id);
  if (!shop.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have permission to make updates.");
    return res.redirect(`/shop/${shop._id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewid } = req.params;
  let review = await Review.findById(reviewid);
  if (!review.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have permission to make updates.");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
};

module.exports.validatePlace = (req, res, next) => {
  const { error } = placeSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
};

module.exports.validateLocalShop = (req, res, next) => {
  const { error } = localShopSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
};