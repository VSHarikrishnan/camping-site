var express = require("express");
var router = express.Router({ mergeParams: true });
var campground = require("../models/campground");
var review = require("../models/review");
var middleware = require("../middleware");

// Reviews Index
router.get("/", function(req, res) {
    campground.findById(req.params.id).populate({
        path: "reviews",
        options: { sort: { createdAt: -1 } } // sorting the populated reviews array to show the latest first
    }).exec(function(err, campground) {
        if (err || !campground) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/index", { campground: campground });
    });
});

// Reviews New
router.get("/new", middleware.isloggedin, middleware.checkreviewexistence, function(req, res) {
    // middleware.checkreviewexistence checks if a user already reviewed the campground, only one review per user is allowed
    campground.findById(req.params.id, function(err, campground) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/new", { campground: campground });

    });
});

// Reviews Create
router.post("/", middleware.isloggedin, middleware.checkreviewexistence, function(req, res) {
    //lookup campground using ID
    campground.findById(req.params.id).populate("reviews").exec(function(err, campground) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        review.create(req.body.review, function(err, review) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            //add author username/id and associated campground to the review
            review.author.id = req.user._id;
            review.author.username = req.user.username;
            review.campground = campground;
            //save review
            review.save();
            campground.reviews.push(review);
            // calculate the new average review for the campground
            campground.rating = calculateAverage(campground.reviews);
            //save campground
            campground.save();
            req.flash("success", "Your review has been successfully added.");
            res.redirect('/campgrounds/' + campground._id);
        });
    });
});

// Reviews Edit
router.get("/:review_id/edit", middleware.checkreviewownership, function(req, res) {
    review.findById(req.params.review_id, function(err, foundReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/edit", { campground_id: req.params.id, review: foundReview });
    });
});

// Reviews Update
router.put("/:review_id", middleware.checkreviewownership, function(req, res) {
    review.findByIdAndUpdate(req.params.review_id, req.body.review, { new: true }, function(err, updatedReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        campground.findById(req.params.id).populate("reviews").exec(function(err, campground) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate campground average
            campground.rating = calculateAverage(campground.reviews);
            //save changes
            campground.save();
            req.flash("success", "Your review was successfully edited.");
            res.redirect('/campgrounds/' + campground._id);
        });
    });
});

// Reviews Delete
router.delete("/:review_id", middleware.checkreviewownership, function(req, res) {
    review.findByIdAndRemove(req.params.review_id, function(err) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        campground.findByIdAndUpdate(req.params.id, { $pull: { reviews: req.params.review_id } }, { new: true }).populate("reviews").exec(function(err, campground) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate campground average
            campground.rating = calculateAverage(campground.reviews);
            //save changes
            campground.save();
            req.flash("success", "Your review was deleted successfully.");
            res.redirect("/campgrounds/" + req.params.id);
        });
    });
});

function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function(element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}

module.exports = router;