const express = require("express");
const router = express.Router();
const { accessToken, createOrder,checkOrderStatus } = require("../controllers/paymentControllers");

router.route("/get-token").get(accessToken)
router.route("/pay").post(createOrder)
router.route("/checkOrderStatus").post(checkOrderStatus)

module.exports = router;