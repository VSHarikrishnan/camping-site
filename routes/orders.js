var express = require("express");
var router = express.Router({ mergeParams: true });
var campground = require("../models/campground");
var comment = require("../models/comment");
var middleware = require("../middleware");
var Cart = require("../models/cart");
var Order = require("../models/order");



router.get('/addtocart/:id', function(req, res, next) {
    var productId = req.params.id;

    var cart = new Cart(req.session.cart ? req.session.cart : {});
    campground.findById(productId, function(err, product) {
        cart.add(product, product.id);
        req.session.cart = cart;
        res.redirect('back');
    });
});


router.get('/remfromcart/:id/m', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart);
    campground.findById(productId, function(err, product) {
        cart.minus(product, product.id);
        req.session.cart = cart;

        res.redirect('back');
    });
});

router.get('/remfromcart/:id/c', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart);
    campground.findById(productId, function(err, product) {
        cart.rem(product, product.id);
        req.session.cart = cart.generateArray();
        res.redirect('back');
    });
});

router.post('/checkout', middleware.isloggedin, function(req, res) {


    var order = new Order({
        name: req.body.name,
        address: req.body.address,
        email: req.body.email,
        phone: req.body.phone,
        cart: req.session.cart
    });
    order.save(function(err, result) {
        if (err) {
            console.log(err);
        }

        req.session.cart = null;

        res.redirect('back');
    });

});
router.get("/orders", middleware.isloggedin, function(req, res) {
    Order.find({}, function(err, orders) {

        if (err) { console.log(err); }

        var cart;
        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();

        });

        res.render("./products/orders", { orders: orders });

    });
});
router.get("/cart", function(req, res) {
    if (!req.session.cart) {
        return res.render("./products/cart", { products: null, totalprice: 0 })
    }
    var cart = new Cart(req.session.cart);
    var x = cart.generateArray();
    res.render("./products/cart", { products: x, totalprice: cart.totalPrice, totalqty: cart.totalQty })
});

router.get("/orderremove", middleware.isloggedin, function(req, res) {
    Order.remove({}, function(err, result) {
        if (err) { console.log(err); }

        res.redirect("back");
    });

});
module.exports = router;