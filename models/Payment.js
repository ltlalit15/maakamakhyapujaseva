const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
 
    data:[]
})
module.exports = mongoose.model("Payment", PaymentSchema);