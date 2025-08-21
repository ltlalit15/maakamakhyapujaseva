const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ User reference
  merchantOrderId: { type: String, required: true },
  transactionId: { type: String },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["PAYMENT_SUCCESS", "PAYMENT_FAILED", "PENDING"],
    default: "PENDING"
  },
  rawResponse: { type: Object }, // optional for debugging
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Payment", paymentSchema);
