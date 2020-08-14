var campground = require("../models/campground");
const comment = require("../models/comment");
var review = require("../models/review");
var middlewareobj = {};


middlewareobj.checkcampgroundownership = function(req, res, next) {
    if (req.isAuthenticated()) {
        campground.findById(req.params.id, function(err, foundcampground) {
            if (err || !foundcampground) {
                console.log(err);

            } else {
                if ((foundcampground.author.id.equals(req.user._id)) || (req.user.isadmin)) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });

    } else {
        res.redirect("back");
    }
}

middlewareobj.checkcommentownership = function(req, res, next) {
    if (req.isAuthenticated()) {
        comment.findById(req.params.comment_id, function(err, foundcomment) {
            if (err || !foundcomment) {
                console.log(err);
                res.redirect("/campgrounds");
            } else {
                if ((foundcomment.author.id.equals(req.user._id)) || (req.user.isadmin)) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });

    } else {
        res.redirect("back");
    }
}

middlewareobj.checkreviewownership = function(req, res, next) {
    if (req.isAuthenticated()) {
        review.findById(req.params.review_id, function(err, foundReview) {
            if (err || !foundReview) {
                res.redirect("back");
            } else {
                // does user own the comment?
                if (foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareobj.checkreviewexistence = function(req, res, next) {
    if (req.isAuthenticated()) {
        campground.findById(req.params.id).populate("reviews").exec(function(err, foundCampground) {
            if (err || !foundCampground) {
                req.flash("error", "campground not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundCampground.reviews
                var foundUserReview = foundCampground.reviews.some(function(review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/campgrounds/" + foundCampground._id);
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};

middlewareobj.isloggedin = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = middlewareobj;