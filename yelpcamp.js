var express = require("express");
var app = express();
var bodyparser = require("body-parser");
var flash = require("connect-flash");
var mongoose = require("mongoose");
var passport = require("passport");
var localstrategy = require("passport-local");
var cookieparser = require("cookie-parser");
var session = require("express-session");
var mongostore = require("connect-mongo")(session);
var methodoverride = require("method-override");
var campground = require("./models/campground");
var user = require("./models/user");
var seeddb = require("./seeds");
var comment = require("./models/comment");

var campgroundroutes = require("./routes/campground.js");
var commentroutes = require("./routes/comment.js");
var authroutes = require("./routes/index.js");
var reviewroutes = require("./routes/review.js");
var ordersroutes = require("./routes/orders");
var middleware = require("./middleware/index.js");



//seeddb();

mongoose.connect("mongodb://localhost/yelpcamp", { useNewUrlParser: true, useUnifiedTopology: true });
app.use(bodyparser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(cookieparser());
app.use(methodoverride("_method"));
app.use(flash());

app.use(session({
    secret: "this is my camping site",
    resave: false,
    saveUninitialized: false,
    store: new mongostore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 5 * 60 * 1000 }
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
    res.locals.session = req.session;
    res.locals.cart = req.session.cart;
    next();
});

app.get("/", function(req, res) {
    res.render("landing");
});
app.use("/campgrounds", campgroundroutes);
app.use("/campgrounds/:id/comments", commentroutes);
app.use(authroutes);
app.use("/campgrounds/:id/reviews", reviewroutes);
app.use(ordersroutes);
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




app.listen(80, process.env.IP, function() {
    console.log("server started");
});