const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Shop = require("../modules/shop.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../modules/review.js");
const { isLoggedin, isReviewAuthor } = require("../miiddleware.js");
const reviewController = require("../controller/shopReview.js"); // separate controller for shop reviews

// Validate review middleware
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
};

// POST new review
router.post(
  "/",
  isLoggedin,
  validateReview,
  wrapAsync(reviewController.reviewAddPostRoute)
);

// Edit review form
router.get("/:reviewid/edit", wrapAsync(reviewController.renderEditForm));

// Edit review POST
router.post(
  "/:reviewid",
  isLoggedin,
  validateReview,
  wrapAsync(reviewController.editReview)
);

// Delete review
router.delete(
  "/:reviewid",
  isLoggedin,
  isReviewAuthor,
  wrapAsync(reviewController.deleteReview)
);

module.exports = router;
