const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  
    name: {
        type: Number

    },
    address: {
        type: String

    },
    email: {
        type: String
    },
    phone: {
        type: String

    },
    price: {
        type: String

    }
}, { timestamps: true });

module.exports = mongoose.model('completed-orders', OrderSchema);
