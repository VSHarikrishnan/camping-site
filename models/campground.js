var mongoose = require("mongoose");
var comment = require("./comment");
var review = require("./review");

var campgroundschema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        username: String
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "comment"
    }],

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "review"
    }],
    rating: {
        type: Number,
        default: 0
    }
});
module.exports = mongoose.model("campground", campgroundschema);