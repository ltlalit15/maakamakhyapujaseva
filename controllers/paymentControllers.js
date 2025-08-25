const AsyncAwaitError = require('../middleware/AsyncAwaitError');
const axios = require('axios');
const CLIENT_ID = "SU2507201201433697692616";
const CLIENT_SECRET = "667bc467-b57a-48d9-8082-c8ebc0d1b0ad";
const CLIENT_VERSION = "1";
const Payment = require('../models/Payment');
const adminOrder = require('../models/Admin-OrderModel'); // Assuming you have an adminOrder model
exports.accessToken = AsyncAwaitError(async (req, res, next) => {
  try {
    const response = await axios.post(
      "https://api.phonepe.com/apis/identity-manager/v1/oauth/token",
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        client_version: CLIENT_VERSION,
        grant_type: "client_credentials",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.json({ access_token: response.data.access_token });
  } catch (error) {
    console.error("Token Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to get access token" });
  }
})

// ✅ Create Order
exports.createOrder = AsyncAwaitError(async (req, res, next) => {
  const { accessToken, amount, userId } = req.body;

  const merchantOrderId = `txn_${Date.now()}`;

  const payload = {
    merchantOrderId,
    amount,
    expireAfter: 1200,
    metaInfo: {
      udf1: "additional-information-1",
      udf2: "additional-information-2",
    },
    paymentFlow: {
      type: "PG_CHECKOUT",
      merchantUrls: {
        redirectUrl: `https://maakamakhyapujaseva-production.up.railway.app/api/v1/checkOrderStatus?merchantOrderId=${merchantOrderId}`,
      },
    },
  };

  try {
    const response = await axios.post(
      "https://api.phonepe.com/apis/pg/checkout/v2/pay",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${accessToken}`,
        },
      }
    );

    // 📝 Save PENDING transaction in DB
    await Payment.create({
      userId,
      merchantOrderId: payload.merchantOrderId,
      amount,
      accessToken, // ✅ store karein future ke liye
      paymentStatus: "PENDING",   // ✅ schema ke field name
      responsePayload: response.data, // ✅ schema ke field name
    });


    res.json(response.data);
  } catch (error) {
    console.error("Payment Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Payment failed" });
  }
});


// ✅ Check Order Status
// ✅ Check Order Status & Redirect
exports.checkOrderStatus = AsyncAwaitError(async (req, res, next) => {
  const { merchantOrderId } = req.query; // redirect ke query me aaega

  try {
    // 📝 Payment record nikal lo DB se
    const payment = await Payment.findOne({ merchantOrderId });
    if (!payment) {
      return res.status(404).send("Payment not found");
    }

    // ✅ Access token DB se uthao
    const accessToken = payment.accessToken;

    // ✅ PhonePe se status check karo
    const response = await axios.get(
      `https://api.phonepe.com/apis/pg/checkout/v2/order/${merchantOrderId}/status`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${accessToken}`,
        },
      }
    );

    const data = response.data?.data;
    console.log("📡 PhonePe Status Response:", data);

    // 📝 Update DB
    const updatedPayment = await Payment.findOneAndUpdate(
      { merchantOrderId },
      {
        paymentStatus: data?.state || "UNKNOWN",
        transactionId: data?.paymentDetails?.[0]?.transactionId || null,
        paymentMode: data?.paymentDetails?.[0]?.paymentMode || null,
        utr: data?.paymentDetails?.[0]?.rail?.utr || null,
        rawResponse: JSON.stringify(data),
      },
      { new: true, runValidators: true }
    );

    console.log("💾 Updated Payment:", updatedPayment);

    // ✅ Redirect based on status
    if (data?.state === "COMPLETED") {
      return res.redirect("https://maakamakhyapujaseva.com/thank-you?status=success");
    } else {
      return res.redirect("https://maakamakhyapujaseva.com/payment-failed?status=failed");
    }

  } catch (error) {
    console.error("❌ Status Check Error:", error.response?.data || error.message);
    return res.redirect("https://maakamakhyapujaseva.com/payment-failed?status=error");
  }
});

exports.transactions = AsyncAwaitError(async (req, res, next) => {


  try {
    const transactions = await Payment.find().populate('userId').sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error("Transactions Error:", error.message);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
})

exports.deleteOrder = AsyncAwaitError(async (req, res, next) => {
  const { id } = req.params; // yeh OrderId hoga frontend se

  try {
    // agar Payment me relation userId ke through hai
    const deletedPayment = await Payment.findOneAndDelete({ userId: id });

    // agar Order ko OrderId se delete karna hai
    const deletedAdminOrder = await adminOrder.findByIdAndDelete(id);

    if (!deletedPayment && !deletedAdminOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      message: "Order deleted successfully",
      payment: deletedPayment,
      order: deletedAdminOrder,
    });
  } catch (error) {
    console.error("Delete Order Error:", error.message);
    res.status(500).json({ error: "Failed to delete order" });
  }
});
