var mongoose = require("mongoose");

var commentschema = mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        username: String
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "review"
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model("comment", commentschema);