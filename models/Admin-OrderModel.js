const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orders: {
        type: [{
            productId: { type: String },
            quantity: { type: String },
            productSize: { type: String },
            productName: { type: String },
            price: { type: String }
        }],
    },
    totalPrice: {
        type: Number

    },
    address: {
        type: String

    },
    city: {
        type: String
    },
    country: {
        type: String

    },
    postCode: {
        type: String

    },
    name: {
        type: String

    },
    phoneNumber: {
        type: String
    },
    age: {
        type: String

    },
    gotra: {
        type: String

    },
    state: {
        type: String
    },


}, { timestamps: true });

module.exports = mongoose.model('admin-Order', OrderSchema);
