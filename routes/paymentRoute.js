const express = require("express");
const router = express.Router();
const { accessToken, createOrder,checkOrderStatus ,transactions} = require("../controllers/paymentControllers");

router.route("/get-token").get(accessToken)
router.route("/transactions").get(transactions)
router.route("/pay").post(createOrder)
router.route("/checkOrderStatus").post(checkOrderStatus)

module.exports = router;