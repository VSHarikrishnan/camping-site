var campground = require("../models/campground");
const comment = require("../models/comment");
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


middlewareobj.isloggedin = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = middlewareobj;