const express = require("express");
const router = express.Router();
const { accessToken, createOrder } = require("../controllers/paymentControllers");

router.route("/get-token").get(accessToken)
router.route("/pay").post(createOrder)

module.exports = router;