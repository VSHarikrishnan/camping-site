var express = require("express");
var router = express.Router();
var campground = require("../models/campground");
var comment = require("../models/comment");
var middleware = require("../middleware");



//index
router.get("/", function(req, res) {
    campground.find({}, function(err, allcampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("../views/campgrounds/index", { campgrounds: allcampgrounds });
        }
    });
});


//create
router.post('/', middleware.isloggedin, function(req, res) {
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
    });
});


//new
router.get("/new", middleware.isloggedin, function(req, res) {
    res.render("../views/campgrounds/new");
});

//show 
router.get("/:id", function(req, res) {
    campground.findById(req.params.id).populate("comments likes").exec(function(err, foundcampground) {
        if (err || !foundcampground) {
            console.log(err);
        } else {
            res.render("../views/campgrounds/show", { campground: foundcampground });
        }
    })

});

//edit
router.get("/:id/edit", middleware.checkcampgroundownership, function(req, res) {
    campground.findById(req.params.id, function(err, foundcampground) {

        req.flash("success", "Updated successfully");
        res.render("../views/campgrounds/edit", { campground: foundcampground });

    });
});

//update
router.put("/:id", middleware.checkcampgroundownership, function(req, res) {
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
router.delete("/:id", middleware.checkcampgroundownership, function(req, res) {
    campground.findByIdAndDelete(req.params.id, function(err, campground) {
        if (err) {
            req.flash("error", "Delete process unsuccessful");
            res.redirect("/campgrounds");
        } else {
            // deletes all comments associated with the campground
            comment.remove({ "_id": { $in: campground.comments } }, function(err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/campgrounds");
                }
            });
            req.flash("success", "Succesfully deleted");
            res.redirect("/campgrounds/");
        }
    });
});

module.exports = router;