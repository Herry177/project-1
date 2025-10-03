const User = require("../modules/user");

// ===================================================================
// 1. SIGNUP
// ===================================================================

module.exports.signupFormRender = (req, res) => {
    res.render("user/signUp.ejs");
};

module.exports.signupPostRoute = async (req, res, next) => {
    try {
        let { email, username, password } = req.body;

        let existingUser = await User.findOne({ email });

        if (existingUser) {
            req.flash("error", "This email is already registered. Please log in.");
            return res.redirect("/login");
        }

        let newUser = new User({
            email,
            username,
            isVerified: true, 
        });

        let registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) {
                console.error("Auto-Login Error:", err);
                return next(err); 
            }
            
            req.flash("success", "Welcome to Trippeo!");
            
            // 💥 FIXED REDIRECT LINE
            const redirectUrl = res.locals.redirectUrl || "/";
            res.redirect(redirectUrl);
        });

    } catch (err) {
        console.error("Signup Error:", err);
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};

// ===================================================================
// 2. LOGIN
// ===================================================================

module.exports.loginFormRender = (req, res) => {
    res.render("user/login.ejs");
};

module.exports.loginPostRoute = (req, res) => {
    // This runs only if passport.authenticate in the router was successful
    req.flash("success", "Welcome Back To Trippeo!");
    let redirect = res.locals.redirectUrl || "/";
    res.redirect(redirect);
};

// ===================================================================
// 3. LOGOUT
// ===================================================================

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You are logged out!");
        res.redirect("/");
    });
};
