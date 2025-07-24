const express = require('express');
const router = express.Router();
const { createOrder,getOrders } = require("../controllers/Admin-OrderCtrl");

router.post("/admin-orders", createOrder)
router.get("/admin-orders", getOrders)

module.exports = router; 
