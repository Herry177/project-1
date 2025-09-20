const Review = require("../modules/review.js");
const Shop = require("../modules/shop.js");

// POST review route
module.exports.reviewAddPostRoute = async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) {
    req.flash("error", "Shop not found!");
    return res.redirect("/shops");
  }

  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;

  await newReview.save();

  // push only ObjectId
  shop.reviews.push(newReview._id);
  await shop.save();

  req.flash("success", "New review created!");
  res.redirect(`/shops/${shop._id}`);
};

// Render edit review form
module.exports.renderEditForm = async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  const review = await Review.findById(req.params.reviewid);

  if (!shop || !review) {
    req.flash("error", "Shop or Review not found!");
    return res.redirect("/shops");
  }

  res.render("reviews/shopEditReview.ejs", { shop, review });
};

// Update review
module.exports.editReview = async (req, res) => {
  const { id, reviewid } = req.params;
  const { rating, comment } = req.body.review;

  await Review.findByIdAndUpdate(reviewid, {
    rating,
    comment,
    updated_at: Date.now(),
  });

  req.flash("success", "Review edited!");
  res.redirect(`/shops/${id}`);
};

// Delete review
module.exports.deleteReview = async (req, res) => {
  const { id, reviewid } = req.params;

  // remove reference from shop
  await Shop.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
  // delete review doc
  await Review.findByIdAndDelete(reviewid);

  req.flash("success", "Review deleted!");
  res.redirect(`/shops/${id}`);
};
