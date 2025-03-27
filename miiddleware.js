const Listing = require("./modules/listing.js");
const Review = require("./modules/review.js");
const { listingSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");


module.exports.isLoggedin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in for Wanderlust");
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

module.exports.isUser = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have permission to make updates.");
    return res.redirect(`/listings/${listing._id}`);
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