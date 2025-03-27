const Review = require("../modules/review.js");
const Listing = require("../modules/listing.js");

//post review route

module.exports.reviewAddPostRoute = async (req, res) => {
  let listing = await Listing.findById(`${req.params.id}`);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;

  listing.reviews.push(newReview);
  console.log(listing);
  await newReview.save();
  await listing.save();
  req.flash("success", "New review created!");
  res.redirect(`/listings/${listing._id}`);
};

//edit review

module.exports.renderEditForm = async (req, res, next) => {
  let listing = await Listing.findById(`${req.params.id}`);
  let review = await Review.findById(`${req.params.reviewid}`);

  res.render("reviews/editReview.ejs", { listing, review });
};

//post of edit route

module.exports.editReview = async (req, res, next) => {
  let { id, reviewid } = req.params;
  let { rating, comment } = req.body.review;

  let listing = await Listing.findByIdAndUpdate(
    { _id: id, "reviews._id": reviewid },
    { $set: { rating: rating, comment: comment, updated_at: Date.now() } }
  );
  let review = await Review.findByIdAndUpdate(reviewid, {
    rating: rating,
    comment: comment,
    updated_at: Date.now(),
  });

  req.flash("success", "Review edited!");
  res.redirect(`/listings/${id}`);
};

//delete review route

module.exports.deleteReview = async (req, res) => {
  let { id, reviewid } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
  await Review.findByIdAndDelete(reviewid);
  req.flash("success", "Review deleted!");
  res.redirect(`/listings/${id}`);
};
