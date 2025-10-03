const User = require("../modules/user");

// ===================================================================
// 1. SIGNUP (Local Strategy - Direct Login)
// ===================================================================

module.exports.signupFormRender = (req, res) => {
    res.render("user/signUp.ejs");
};

module.exports.signupPostRoute = async (req, res, next) => {
    try {
        let { email, username, password } = req.body;

        // Check if email is already registered
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash("error", "This email is already registered. Please log in.");
            return res.redirect("/login");
        }

        // Create new user, automatically setting them as verified
        let newUser = new User({
            email,
            username,
            isVerified: true,
        });

        // Register the user and hash password
        let registeredUser = await User.register(newUser, password);

        // Auto-login the user immediately after registration
        req.login(registeredUser, (err) => {
            if (err) {
                console.error("Auto-Login Error:", err);
                return next(err);
            }
            
            req.flash("success", "Welcome to Trippeo!");
            
            // Redirect using the saved URL from the middleware
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
// 2. LOGIN (Local and Google Strategy Handler)
// ===================================================================

module.exports.loginFormRender = (req, res) => {
    res.render("user/login.ejs");
};

module.exports.loginPostRoute = (req, res) => {
    // This function handles successful redirects for BOTH Local and Google strategies
    req.flash("success", "Welcome Back!");
    
    // Redirect to the intended URL
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
