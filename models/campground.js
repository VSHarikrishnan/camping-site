var mongoose = require("mongoose");
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
    }]
});
module.exports = mongoose.model("campground", campgroundschema);