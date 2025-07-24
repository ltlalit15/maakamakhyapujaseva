const express = require('express');
const { newOrder, getSingleOrder, loggedInUserOrder, getAllOrder, updateOrder, deleteOrder } = require('../controllers/orderController');
const router = express.Router();

router.route("/order/new").post(newOrder);
router.route("/order/:id").get(getSingleOrder); // This should work without authentication now
router.route("/orders/me").get(loggedInUserOrder);
router.route("/admin/orders").get(getAllOrder);
router.route("/admin/orders/:id").put(updateOrder).delete(deleteOrder);

module.exports = router;
