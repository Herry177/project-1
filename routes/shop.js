const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Shop = require("../modules/shop.js");
const { isLoggedin, validateLocalShop, isUserLocalShop } = require("../miiddleware.js");
const shopController = require("../controller/shop.js");
const multer = require("multer");
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });


router.route("/")
  .get(wrapAsync(shopController.index))  
  .post(
    isLoggedin,
    upload.array("shop[image][]"),
    validateLocalShop,
    wrapAsync(shopController.createShop)
  );

router.get("/new", isLoggedin, shopController.renderNewForm);

router.get("/:id/edit", isLoggedin, isUserLocalShop, wrapAsync(shopController.editShop));

router.route("/:id")
  .get(wrapAsync(shopController.showShop))
  .put(
    isLoggedin,
    isUserLocalShop,
    upload.array("shop[image][]"),
    validateLocalShop,
    wrapAsync(shopController.updateShop)
  )
  .delete(isLoggedin, isUserLocalShop, wrapAsync(shopController.deleteShop));

router.get(
  "/:curruserid/your",
  isLoggedin,
  shopController.seeYoursShops
);

//see category wise
router.get("/category/:name", shopController.category)

module.exports = router;
