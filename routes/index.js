var express = require("express");
var router = express.Router({ mergeParams: true });
var passport = require("passport");
var campground = require("../models/campground");
var comment = require("../models/comment");
var middleware = require("../middleware");


//=====================================
//auth routes
//==============================

router.get("/register", function(req, res) {
    res.render("register");

});


router.post('/register', function(req, res) {

    var newuser = new user({ username: req.body.username });
    if (req.body.admincode === "admin123") {
        newuser.isadmin = true;
    }
    user.register(newuser, req.body.password, function(err, user) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("register");
            //return res.render("register", { "error": err.message });
        }
        passport.authenticate("local")(req, res, function() {
            req.flash("success", "Successfully registered");
            res.redirect("/campgrounds");
        });

    });
});

router.get("/login", function(req, res) {
    res.render("login");
});

router.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: "please login to continue"
}), function(req, res) {
    req.flash("success", "successfully logged in");
    res.redirect("/campgrounds");

});

router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "you have been logged out");
    res.redirect("/campgrounds");
});


module.exports = router;