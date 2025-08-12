const express = require('express');
const router = express.Router();
const { createOrder,getOrders , getcheckout , createCheackout} = require("../controllers/Admin-OrderCtrl");

router.post("/admin-orders", createOrder)
router.get("/admin-orders", getOrders)
router.post("/checkout", getcheckout)
router.get("/checkout", createCheackout)

module.exports = router; 
