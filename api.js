const axios = require('axios');
const crypto = require('crypto');

// Define base parameters
const url = 'https://open.miravia.com/orders/items/get';
const appKey = '509246';
const appSecret = 'zFGlD11pBhzevuBWeUxi9DafYMa5vWzK';
const accessToken = '50000700841eJnVr7jAPzvqBdckwHiTBWSF6gCx4luUDkDKmyIiwd143720b0439';

// Define API parameters
const orderIds = '[42922, 32793]';
const timestamp = Date.now(); // Current timestamp in milliseconds

// Generate the signature
const paramsToSign = `app_key=${appKey}&order_ids=${orderIds}&timestamp=${timestamp}`;
const stringToSign = paramsToSign + appSecret; // Appending the secret
const sign = crypto.createHash('sha256').update(stringToSign).digest('hex');

// Prepare query parameters
const queryParams = new URLSearchParams({
  app_key: appKey,
  timestamp: timestamp,
  sign: sign,
  access_token: accessToken,
  order_ids: orderIds,
});

// Make the API request
(async () => {
  try {
    const response = await axios.get(`${url}?${queryParams.toString()}`);
    console.log('Response JSON:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
})();
