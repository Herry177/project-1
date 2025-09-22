const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../modules/listing.js");
const { isLoggedin, isUserListing, validateListing } = require("../miiddleware.js");
const listingController = require("../controller/listing.js");
const multer = require("multer");
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });

//privecy policy
router.get("/privacy", listingController.privacyPolicy);

//privecy policy
router.get("/terms", listingController.terms);

router
  .route("/")
  //index or home route
  .get(wrapAsync(listingController.index))
  //adding or save listings
  .post(
    isLoggedin,
    upload.array("listing[image][]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

//new route
router.get("/new", isLoggedin, listingController.renderNewForm);

//edit route
router.get(
  "/:id/edit",
  isLoggedin,
  isUserListing,
  wrapAsync(listingController.editListing)
);

router
  .route("/:id")
  //update route
  .put(
    isLoggedin,
    isUserListing,
    upload.array("listing[image][]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  //delete route
  .delete(isLoggedin, isUserListing, wrapAsync(listingController.deleteListing))
  //show route
  .get(wrapAsync(listingController.showListing));

//see listings created by you
router.get(
  "/:curruserid/your/listed",
  isLoggedin,
  listingController.seeYoursListings
);

//see category wise
router.get("/category/:name", listingController.category)

module.exports = router;

