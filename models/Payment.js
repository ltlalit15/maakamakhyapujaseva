const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin-Order",
      required: true,
    },

    merchantOrderId: {
      type: String,
      required: true,
      unique: true, // ek transaction ek hi baar ho
    },

    providerReferenceId: {
      type: String,
      default: null, // PhonePe / Provider se milega
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },

    paymentMethod: {
      type: String,
      default: null, // e.g., UPI, Wallet, NetBanking
    },

    orderId: {
      type: String,
      default: null, // Agar order se link karna ho
    },

    responsePayload: {
      type: Object,
      default: {},
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
