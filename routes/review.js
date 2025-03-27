const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../modules/listing.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../modules/review.js");
const { isLoggedin, isReviewAuthor } = require("../miiddleware.js");
const reviewController = require("../controller/review.js")

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
};

//Reviews
//post review route

router.post(
  "/",
  isLoggedin,
  validateReview,
  wrapAsync(reviewController.reviewAddPostRoute)
);

//edit review

router.get("/:reviewid/edit", reviewController.renderEditForm);

router.route("/:reviewid")
//post of edit route
.post(
  isLoggedin,
  validateReview,
  wrapAsync(reviewController.editReview)
)
//delete review route
.delete(
  isLoggedin,
  isReviewAuthor,
  wrapAsync(reviewController.deleteReview)
);

module.exports = router;
