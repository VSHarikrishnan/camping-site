module.exports = function Cart(oldCart) {
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    this.add = function(item, id) {
        var storedItem = this.items[id];
        if (!storedItem) {
            storedItem = this.items[id] = { item: item, qty: 0, price: 0 };
        }

        storedItem.qty++;
        storedItem.price = storedItem.item.price * storedItem.qty;
        this.totalQty++;
        this.totalPrice += storedItem.item.price;
    };
    this.minus = function(item, id) {
        var storedItem = this.items[id];
        storedItem.qty--;
        storedItem.price = storedItem.item.price * storedItem.qty;
        this.totalQty--;
        this.totalPrice -= storedItem.item.price;
    };

    this.rem = function(item, id) {
        var storedItem = this.items[id];
        this.totalQty -= storedItem.qty;
        storedItem.qty = 0;
        storedItem.price = storedItem.item.price * storedItem.qty;
        this.totalPrice -= storedItem.item.price;
    };

    this.generateArray = function() {
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }

        return arr;
    };
};