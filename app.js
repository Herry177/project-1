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

const stateSearchBasedRoute = require("./routes/stateSearchBased.js");
const listingRoute = require("./routes/listing.js");
const reviewRoute = require("./routes/review.js");
const userRoute = require("./routes/user.js");

const shopRoute = require("./routes/shop.js");
const shopReview = require("./routes/shopReview.js")

const placeRoute = require("./routes/place.js");
const placeReview = require("./routes/placeReview.js")

const stateRoute = require("./routes/state.js");

const dbUrl = 'mongodb://127.0.0.1:27017/wanderlust';

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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600
})

store.on("error", (err) => {
  console.log("ERROR IN MONGO SESSION STORE", err)
})

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

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = new User({
        googleId: profile.id,
        username: profile.displayName,
        email: profile.emails[0].value // Assuming the email is provided
      });
      await user.save();
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));
;

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new Localstrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.get("/", (req, res) => { res.render("main.ejs") });
app.use("/", userRoute);
app.use("/states", stateSearchBasedRoute);
app.use("/listings", listingRoute);           
app.use("/listings/:id/review", reviewRoute);
app.use("/shops", shopRoute);
app.use("/shops/:id/review", shopReview);                
app.use("/places", placeRoute); 
app.use("/places/:id/review", placeReview);             
app.use("/states", stateRoute);              

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statuscode = 500, message = "Something Went Wrong" } = err;
  let no = Math.floor(Math.random() * 3) + 1;
  res.status(statuscode).render("err.ejs", { err, no });
});

const port = 8080;
app.listen(port, () => {
  console.log("SERVER IS LISTENING ON PORT:", port);
});
