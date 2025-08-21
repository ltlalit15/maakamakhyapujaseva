const AsyncAwaitError = require('../middleware/AsyncAwaitError');
const axios = require('axios');
const CLIENT_ID = "SU2507201201433697692616";
const CLIENT_SECRET = "667bc467-b57a-48d9-8082-c8ebc0d1b0ad";
const CLIENT_VERSION = "1";
const Payment = require('../models/Payment');

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
        redirectUrl: "https://maakamakhyapujaseva.com",
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
      merchantOrderId,
      amount,
      status: "PENDING",
      rawResponse: response.data,
    });

    res.json(response.data);
  } catch (error) {
    console.error("Payment Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Payment failed" });
  }
});


// ✅ Check Order Status
exports.checkOrderStatus = AsyncAwaitError(async (req, res, next) => {
  const { accessToken, merchantOrderId } = req.body;

  try {
    const response = await axios.get(
      `https://api.phonepe.com/apis/pg/checkout/v2/order/${merchantOrderId}/status`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${accessToken}`,
        },
      }
    );

    const data = response.data;

    // 📝 Update transaction in DB
    await Payment.findOneAndUpdate(
      { merchantOrderId },
      {
        status: data.state,
        transactionId: data.paymentDetails?.[0]?.transactionId || null,
        paymentMode: data.paymentDetails?.[0]?.paymentMode || null,
        utr: data.paymentDetails?.[0]?.rail?.utr || null,
        rawResponse: data,
      }
    );

    res.json(data);
  } catch (error) {
    console.error("Status Check Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Status check failed" });
  }
});
