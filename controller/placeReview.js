const Review = require("../modules/review.js");
const Place = require("../modules/place.js");

// ----------------------------
// Add new review
// ----------------------------
module.exports.reviewAddPostRoute = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) {
      req.flash("error", "Place not found!");
      return res.redirect("/places");
    }

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    await newReview.save();

    // push only the ObjectId
    place.reviews.push(newReview._id);
    await place.save();

    req.flash("success", "New review created!");
    res.redirect(`/places/${place._id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while adding review!");
    res.redirect("/places");
  }
};

// ----------------------------
// Render edit review form
// ----------------------------
module.exports.renderEditForm = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    const review = await Review.findById(req.params.reviewid);

    if (!place || !review) {
      req.flash("error", "Place or Review not found!");
      return res.redirect("/places");
    }

    res.render("reviews/placeEditReview.ejs", { place, review });
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to load review edit form!");
    res.redirect("/places");
  }
};

// ----------------------------
// Update review
// ----------------------------
module.exports.editReview = async (req, res) => {
  try {
    const { id, reviewid } = req.params;
    const { rating, comment } = req.body.review;

    const review = await Review.findByIdAndUpdate(
      reviewid,
      {
        rating,
        comment,
        updated_at: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!review) {
      req.flash("error", "Review not found!");
      return res.redirect(`/places/${id}`);
    }

    req.flash("success", "Review edited successfully!");
    res.redirect(`/places/${id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while editing review!");
    res.redirect(`/places/${req.params.id}`);
  }
};

// ----------------------------
// Delete review
// ----------------------------
module.exports.deleteReview = async (req, res) => {
  try {
    const { id, reviewid } = req.params;

    // remove reference from place
    await Place.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });

    // delete review itself
    await Review.findByIdAndDelete(reviewid);

    req.flash("success", "Review deleted!");
    res.redirect(`/places/${id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while deleting review!");
    res.redirect(`/places/${req.params.id}`);
  }
};
