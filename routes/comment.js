var express = require("express");
var router = express.Router({ mergeParams: true });
var campground = require("../models/campground");
var comment = require("../models/comment");
var middleware = require("../middleware");

//=======================================
//COMMENTS
//=======================================
router.get("/new", middleware.isloggedin, function(req, res) {
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

router.post('/', middleware.isloggedin, function(req, res) {


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
router.get("/:comment_id/edit", middleware.checkcommentownership, function(req, res) {
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
router.put("/:comment_id", middleware.checkcommentownership, function(req, res) {
    comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatecomment) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            console.log(req.params.comment_id);
            console.log(req.params.body);
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//delete
router.delete("/:comment_id", middleware.checkcommentownership, function(req, res) {
    comment.findByIdAndDelete(req.params.comment_id, function(err, comment) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/");
        }
    });
});

module.exports = router;