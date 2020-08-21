var mongoose = require("mongoose");
var orderschema = new mongoose.Schema({
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        username: String
    },
    email: String,
    phone: Number,
    address: String,
    cart: { type: Object }


}, {
    timestamps: true
});
module.exports = mongoose.model("order", orderschema);