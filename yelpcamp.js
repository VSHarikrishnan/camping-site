var express = require("express");
var app = express();
var bodyparser = require("body-parser");
var flash = require("connect-flash");
var mongoose = require("mongoose");
var passport = require("passport");
var localstrategy = require("passport-local");
var methodoverride = require("method-override");
var campground = require("./models/campground");
var user = require("./models/user");
var seeddb = require("./seeds");
var comment = require("./models/comment");
var campgroundroutes = require("./routes/campground.js");
var commentroutes = require("./routes/comment.js");
var middleware = require("./middleware/index.js");



//seeddb();

mongoose.connect("mongodb://localhost/yelpcamp", { useNewUrlParser: true, useUnifiedTopology: true });
app.use(bodyparser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodoverride("_method"));
app.use(flash());

app.use(require("express-session")({
    secret: "this is my camping site",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentuser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.get("/", function(req, res) {
    res.render("landing");
});
app.use("/campgrounds", campgroundroutes);
app.use("/campgrounds/:id/comments", commentroutes);

//========================================
// campground Like Route
//========================================
app.post("/campgrounds/:id/like", middleware.isloggedin, function(req, res) {
    campground.findById(req.params.id, function(err, foundcampground) {
        if (err) {
            console.log(err);
            return res.redirect("/campgrounds");
        }

        // check if req.user._id exists in foundCampground.likes
        var founduserlike = foundcampground.likes.some(function(like) {
            return like.equals(req.user._id);
        });

        if (founduserlike) {
            // user already liked, removing like
            foundcampground.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundcampground.likes.push(req.user);
        }

        foundcampground.save(function(err) {
            if (err) {
                console.log(err);
                return res.redirect("/campgrounds");
            }
            return res.redirect("/campgrounds/" + foundcampground._id);
        });
    });
});



//=====================================
//auth routes
//==============================

app.get("/register", function(req, res) {
    res.render("register");

});


app.post('/register', function(req, res) {

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

app.get("/login", function(req, res) {
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: "please login to continue"
}), function(req, res) {
    req.flash("success", "successfully logged in");
    res.redirect("/campgrounds");

});

app.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "you have been logged out");
    res.redirect("/campgrounds");
});





app.listen(80, process.env.IP, function() {
    console.log("server started");
});