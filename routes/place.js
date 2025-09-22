const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Place = require("../modules/place.js");
const { isLoggedin, validatePlace, isUserPlace } = require("../miiddleware.js");
const placeController = require("../controller/place.js");
const multer = require("multer");
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });


router.route("/")
  .get(wrapAsync(placeController.index))
  .post(
    isLoggedin,
    upload.array("place[image][]"),
    validatePlace,
    wrapAsync(placeController.createPlace)
  );

router.get("/new", isLoggedin, placeController.renderNewForm);

router.get("/:id/edit", isLoggedin, isUserPlace, wrapAsync(placeController.editPlace));

router.route("/:id")
  .get(wrapAsync(placeController.showPlace))
  .put(
    isLoggedin,
    isUserPlace,
    upload.array("place[image][]"),
    validatePlace,
    wrapAsync(placeController.updatePlace)
  )
  .delete(isLoggedin, isUserPlace, wrapAsync(placeController.deletePlace));

//see places added by you
router.get(
  "/:curruserid/your",
  isLoggedin,
  placeController.seeYoursPlaces
);

//see category wise
router.get("/type/:name", placeController.category)

module.exports = router;


