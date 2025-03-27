const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../modules/listing.js");
const { isLoggedin, isUser, validateListing } = require("../miiddleware.js");
const listingController = require("../controller/listing.js");
const multer = require("multer");
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });

//search route
router.get("/search", listingController.search)

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
  isUser,
  wrapAsync(listingController.editListing)
);

router
  .route("/:id")
  //update route
  .put(
    isLoggedin,
    isUser,
    upload.array("listing[image][]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  //delete route
  .delete(isLoggedin, isUser, wrapAsync(listingController.deleteListing))
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
