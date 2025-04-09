const User = require("../modules/user.js");
const {commonPasswords} = require("../commonpasses.js")

module.exports.signupFormRender = (req, res) => {
  res.render("user/signUp.ejs");
};

module.exports.signupPostRoute = async (req, res) => {
  try {
    let { email, username, password } = req.body;
    if (password) {
      for (i = 0; i < commonPasswords.length; i++) {
        if (password === commonPasswords[i] || password === username) {
          req.flash(
            "error",
            "You used most common password or don't use username as a password!"
          );
          return res.redirect("/signup");
        }
      }
    }
    let newUser = new User({ email, username });
    let registredUser = await User.register(newUser, password);
    req.login(registredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.loginFormRender = (req, res) => {
  res.render("user/login.ejs");
};

module.exports.loginPostRoute = async (req, res) => {
  req.flash("success", "Welcome Back To Wanderlust!");

  let redirect = res.locals.redirectUrl || "/listings";
  res.redirect(redirect);
};

module.exports.logout = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};
