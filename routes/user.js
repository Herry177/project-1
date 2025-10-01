const express = require("express");
const router = express.Router();
const User = require("../modules/user.js");
const wrapAsync = require("../utils/wrapAsync.js"); // Ensure this is imported
const passport = require("passport");
const { saveredirectUrl } = require("../miiddleware.js");
const { commonPasswords } = require("../commonpasses.js");
const userController = require("../controller/user.js");
const user = require("../modules/user.js");

router.route("/signup")
  .get(userController.signupFormRender)
  .post(
    wrapAsync(userController.signupPostRoute)
  );

// --- UPDATED LOGIN ROUTE WITH VERIFICATION CHECK ---
router.route("/login")
  .get(userController.loginFormRender)
  .post(
    saveredirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    (req, res, next) => {
      if (req.user && !req.user.isVerified) {
        req.logout((err) => {
          if (err) {
            return next(err);
          }
          req.flash("error", "Please verify your email to log in.");
          res.redirect("/login");
        });
      } else {
        next();
      }
    },
    userController.loginPostRoute
  );

// --- Google Login Routes ---
router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Successfully logged in with Google!");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  }
);

// --- Logout Route ---
router.get("/logout", userController.logout);

// --- NEW EMAIL VERIFICATION ROUTES ---
router.get("/verify", userController.verifyFormRender);

// FIX APPLIED: Wrapped the async function in wrapAsync
router.post("/verify", wrapAsync(userController.verifyAccount));

module.exports = router;