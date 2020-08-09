//if (req.isAuthenticated()) {

campground.findById(req.params.id, function(err, foundcampground) {
    if (err) {
        console.log(err);
        res.redirect("/campgrounds");
    } else {

        res.render("./campgrounds/edit", { campground: foundcampground });
    }
});
// } else {
//      res.send("log in first");
// }