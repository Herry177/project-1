const express = require("express");
const router = express.Router();
const User = require("../modules/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveredirectUrl } = require("../miiddleware.js");
const { commonPasswords } = require("../commonpasses.js");
const userController = require("../controller/user.js");

router.route("/signup")
//signup routes
.get(userController.signupFormRender)
.post(
  wrapAsync(userController.signupPostRoute)
);

router.route("/login")
//login routes
.get(userController.loginFormRender)
.post(
  saveredirectUrl, 
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  // CRUCIAL: Middleware to prevent unverified users from logging in
  (req, res, next) => {
      if (req.user && !req.user.isVerified) {
          req.logout((err) => {
              if (err) return next(err);
              req.flash("error", "Please verify your email to log in.");
              return res.redirect(`/verify?email=${encodeURIComponent(req.user.email)}`);
          });
      } else {
          next();
      }
  },
  userController.loginPostRoute
);

//logout route
router.get("/logout", userController.logout);

// --- NEW EMAIL VERIFICATION ROUTES ---
router.get("/verify", userController.verifyFormRender);
router.post("/verify", wrapAsync(userController.verifyAccount)); // CRUCIAL: Use wrapAsync for async function

module.exports = router;