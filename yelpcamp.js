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
var middleware = require("../yelpcamp/middleware/index.js")



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

//index
app.get("/campgrounds", function(req, res) {
    campground.find({}, function(err, allcampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("./campgrounds/index", { campgrounds: allcampgrounds });

        }
    });

});


//create
app.post('/campgrounds', middleware.isloggedin, function(req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var price = req.body.price;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newcampground = { name: name, image: image, price: price, description: description, author: author }
    campground.create(newcampground, function(err, newcampground) {
        if (err) {
            console.log(err);
        } else {
            req.flash("success", "New campground created successfully ");
            res.redirect("/campgrounds");
        }
    })


});

//new
app.get("/campgrounds/new", middleware.isloggedin, function(req, res) {
    res.render("./campgrounds/new");
});

//show 
app.get("/campgrounds/:id", function(req, res) {
    campground.findById(req.params.id).populate("comments").exec(function(err, foundcampground) {
        if (err || !foundcampground) {
            console.log(err);
        } else {
            res.render("./campgrounds/show", { campground: foundcampground });
        }
    })

});

//edit
app.get("/campgrounds/:id/edit", middleware.checkcampgroundownership, function(req, res) {
    campground.findById(req.params.id, function(err, foundcampground) {

        req.flash("success", "Updated successfully");
        res.render("./campgrounds/edit", { campground: foundcampground });

    });
});

//update
app.put("/campgrounds/:id", middleware.checkcampgroundownership, function(req, res) {
    campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedcampground) {
        if (err) {
            console.log(err);
            req.flash("error", "Update process unsuccessful");
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Update successful");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});
//delete
app.delete("/campgrounds/:id", middleware.checkcampgroundownership, function(req, res) {
    campground.findByIdAndDelete(req.params.id, function(err, campground) {
        if (err) {
            req.flash("error", "Delete process unsuccessful");
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Succesfully deleted");
            res.redirect("/campgrounds/");
        }
    });
});


//=======================================
//COMMENTS
//=======================================
app.get("/campgrounds/:id/comments/new", middleware.isloggedin, function(req, res) {
    campground.find({}, function(err, allcampgrounds) {
        campground.findById(req.params.id, function(err, campground) {

            if (err) {
                console.log(err);
            } else {
                res.render("./comments/new", { campground: campground });

            }
        });
    });

});

app.post('/campgrounds/:id/comments', middleware.isloggedin, function(req, res) {


    campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            comment.create(req.body.comment, function(err, comment) {
                if (err) {
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }

    });

});
//edit
app.get("/campgrounds/:id/comments/:comment_id/edit", middleware.checkcommentownership, function(req, res) {
    comment.findById(req.params.comment_id, function(err, foundcomment) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {

            res.render("./comments/edit", { campground_id: req.params.id, comment: foundcomment });
        }

    });
});

//update
app.put("/campgrounds/:id/comments/:comment_id", middleware.checkcommentownership, function(req, res) {
    comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatecomment) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});


app.delete("/campgrounds/:id/comments/:comment_id", middleware.checkcommentownership, function(req, res) {
    comment.findByIdAndDelete(req.params.comment_id, function(err, comment) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/");
        }
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
    successRedirect: "/campgrounds",
    successFlash: "welcome to yelpcamp",
    failureRedirect: "/login"
}), function(req, res) {

});

app.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "you have been logged out");
    res.redirect("/campgrounds");
});





app.listen(80, process.env.IP, function() {
    console.log("server started");
});