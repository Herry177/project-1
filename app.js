if (process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}

const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const Localstrategy = require("passport-local");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const User = require("./modules/user.js");
const Place = require("./modules/place.js");
const Shop  = require("./modules/shop.js");
const Listing = require("./modules/listing.js");

// Routes
const searchAll = require("./routes/search.js");
const stateSearchBasedRoute = require("./routes/stateSearchBased.js");
const listingRoute = require("./routes/listing.js");
const reviewRoute = require("./routes/review.js");
const userRoute = require("./routes/user.js");
const shopRoute = require("./routes/shop.js");
const shopReview = require("./routes/shopReview.js");
const placeRoute = require("./routes/place.js");
const placeReview = require("./routes/placeReview.js");
const stateRoute = require("./routes/state.js");

const dbUrl = process.env.ATLASDB_URL;

// DB Connection
main()
  .then(() => {
    console.log("SUCCESSFULLY CONNECTED WITH SERVER");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

// View Engine & Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

// Session Store
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600
});

store.on("error", (err) => {
  console.log("ERROR IN MONGO SESSION STORE", err)
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// Passport Strategies
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://project-1-vp72.onrender.com/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      // 1. Check if user exists with googleId
      let user = await User.findOne({ googleId: profile.id });

      // 2. If not, check if a user with same email exists
      if (!user && profile.emails && profile.emails.length > 0) {
        user = await User.findOne({ email: profile.emails[0].value });
      }

      // 3. If still not found, create new
      if (!user) {
        user = new User({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value
        });
        await user.save();
      } else if (!user.googleId) {
        // 4. If user existed by email but had no googleId, link it
        user.googleId = profile.id;
        await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new Localstrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global variables for templates
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Routes
app.get("/", async (req, res) => {
    try {
        let [trendingListings, trendingShops, trendingPlaces] = await Promise.all([
            Listing.find({
                $or: [{ category: "Trending" }, { category: "5-star" }]
            }),
            Shop.find({
                $or: [{ category: "Trending" }, { category: "5-star" }]
            }),
            Place.find({
                $or: [{ type: "Trending" }, { type: "5-star" }]
            }),
        ]);
        console.log(trendingListings, trendingShops, trendingPlaces)

        // Pass the three separate arrays to the EJS template
        res.render("main.ejs", { trendingListings, trendingShops, trendingPlaces });

    } catch (err) {
        console.error("Error fetching items:", err);
        res.status(500).send("An error occurred while fetching data.");
    }
});

app.use("/", userRoute);
app.use("/search", searchAll);
app.use("/states", stateSearchBasedRoute);
app.use("/listings", listingRoute);
app.use("/listings/:id/review", reviewRoute);
app.use("/shops", shopRoute);
app.use("/shops/:id/review", shopReview);
app.use("/places", placeRoute);
app.use("/places/:id/review", placeReview);
app.use("/states", stateRoute);

// 404 handler
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Error handler
app.use((err, req, res, next) => {
  let { statuscode = 500, message = "Something Went Wrong" } = err;
  let no = Math.floor(Math.random() * 3) + 1;
  res.status(statuscode).render("err.ejs", { err, no });
});

// Start Server
const port = 3000;
app.listen(port, () => {
  console.log("SERVER IS LISTENING ON PORT:", port);
});

