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

exports.createOrder = AsyncAwaitError(async (req, res, next) => {
  const { accessToken, amount } = req.body;

  const payload = {
    merchantOrderId: `txn_${Date.now()}`,
    amount,
    expireAfter: 1200,
    metaInfo: {
      udf1: "additional-information-1",
      udf2: "additional-information-2",
      udf3: "additional-information-3",
      udf4: "additional-information-4",
      udf5: "additional-information-5",
    },
    paymentFlow: {
      type: "PG_CHECKOUT",
      message: "Payment message used for collect requests",
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
    console.log("Payment Response:", response);
  await Payment.create({ data: response.data }); // ✅ only data
    res.json(response.data);
  } catch (error) {
    console.error("Payment Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Payment failed" });
  }
})