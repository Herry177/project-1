const Listing = require("../modules/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const map_Token = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: map_Token });

//index or home route

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listing/index.ejs", { allListings });
};

//searching route

module.exports.search = async (req, res, next) => {
  let { search } = req.query;
  if (!isNaN(search)) {
    search = Number(search);
    let listings = await Listing.find({ price: search })
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");
    if (!listings || listings.length === 0) {
      req.flash(
        "error",
        "The requested listings doesn't exists or has been deleted"
      );
      return res.redirect("/listings");
    }

    if (listings.length > 1) {
      return res.render("listing/search2.ejs", { listings });
    } else {
      sum = 0;
      count = 0;
      for (review of listings[0].reviews) {
        sum = sum + review.rating;
        count++;
      }
      sum = sum / listings[0].reviews.length;
      res.render("listing/search.ejs", { listings, sum, count });
    }
  } else {
    let listings = await Listing.find({
      $or: [
        { title: search },
        { description: search },
        { location: search },
        { country: search },
      ],
    })
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");
    if (!listings || listings.length === 0) {
      req.flash(
        "error",
        "The requested listings doesn't exists or has been deleted"
      );
      return res.redirect("/listings");
    }

    if (listings.length > 1) {
      return res.render("listing/search2.ejs", { listings });
    } else {
      sum = 0;
      count = 0;
      for (review of listings[0].reviews) {
        sum = sum + review.rating;
        count++;
      }
      sum = sum / listings[0].reviews.length;
      res.render("listing/search.ejs", { listings, sum, count });
    }
  }
};

//new route

module.exports.renderNewForm = (req, res) => {
  console.log(req.user);
  res.render("listing/new.ejs");
};

//create route  //adding or save listings

module.exports.createListing = async (req, res, next) => {
  let respones = await geocodingClient.forwardGeocode({
    query: `${req.body.listing.location} ${req.body.listing.country}`,
    limit: 1
  })
    .send()
  let coordinate = respones.body.features[0].geometry;
 
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.geometry = coordinate;
  for (i = 0; i < req.files.length; i++) {
    let url = req.files[i].path;
    let filename = req.files[i].filename;
    newListing.image.push({ url, filename });
  }
  let savedListing = await newListing.save();
  console.log(savedListing)
  req.flash("success", "New listing created!");
  res.redirect(`/listings`);
};

//edit route

module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(`${id}`);
  if (!listing) {
    req.flash(
      "error",
      "The requested listing doesn't exists or has been deleted"
    );
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image[0].url;
  originalImageUrl.replace("/upload", "/upload/h_150,w_250");
  res.render("listing/edit.ejs", { listing, originalImageUrl });
};

//update route

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  console.log(req.body);
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.files !== "undefined") {
    if (req.files.length === 1) {
      let url = req.files[0].path;
      let filename = req.files[0].filename;
      listing.image.unshift({url, filename});
    } else {
      for (i = 0; i < req.files.length; i++) {
        let url = req.files[i].path;
        let filename = req.files[i].filename;
        listing.image.push({ url, filename });
      }
    }
    await listing.save();
  }

  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

//delete route

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  console.log(id);
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};

//show route

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash(
      "error",
      "The requested listing doesn't exists or has been deleted"
    );
    res.redirect("/listings");
  }
  sum = 0;
  count = 0;
  for (review of listing.reviews) {
    sum = sum + review.rating;
    count++;
  }
  sum = sum / listing.reviews.length;
  res.render("listing/show.ejs", { listing, sum, count });
};

//see listings created by you

module.exports.seeYoursListings = async (req, res, next) => {
  let { curruserid } = req.params;
  let listings = await Listing.find({ owner: curruserid });
  if (listings && listings.length) {
    return res.render("listing/your_listings.ejs", { listings });
  }
  req.flash("error", "You don't created any listings!");
  res.redirect("/listings");
};

module.exports.category = async (req, res, next) => {
  let {name} = req.params;
  let listings = await Listing.find({ category: name });
  if (listings && listings.length) {
    return res.render("listing/category.ejs", { listings , name});
  }
  req.flash("error", "Any listing not matches with this category!");
  res.redirect("/listings");
}