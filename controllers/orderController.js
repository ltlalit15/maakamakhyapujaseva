const AsyncAwaitError = require('../middleware/AsyncAwaitError');
const Order = require('../models/orderModel');
const Product = require("../models/productModels");
const mongoose = require('mongoose');

// Creating New Order
exports.newOrder = AsyncAwaitError(async (req, res, next) => {
    const { shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        productSize,
        paidAt: Date.now(),
        user: req.ourUser._id
    })

    res.status(201).json({
        success: true,
        message: "New Order Created",
        order
    })
})

// Get Single Order Details

exports.getSingleOrder = async (req, res, next) => {
    try {
        // Check if the provided ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        // Find the order by its ID and populate the 'user' field with 'name' and 'email'
        const order = await Order.findById(req.params.id)

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found with this ID"
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        // Handle any errors that may occur during execution
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error MEE"
        });
    }
};

// Get Logged In User Order Details
exports.loggedInUserOrder = AsyncAwaitError(async (req, res, next) => {
    const orders = await Order.find({ user: req.ourUser._id });

    res.status(200).json({
        success: true,
        orders
    })
})

// get all orders -- ADMIN
exports.getAllOrder = AsyncAwaitError(async (req, res, next) => {
    const orders = await Order.find();

    // for Getting Total Price Amount of All Orders
    let totalAmount = 0;
    orders.forEach((orderSum) => {
        totalAmount += orderSum.totalPrice;
    })
    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})

// Order Status Update --ADMIN
exports.updateOrder = AsyncAwaitError(async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found with this ID"
            });
        }

        if (order.orderStatus === "Delivered") {
            return res.status(400).json({
                message: "The Order is Already Delivered"
            });
        }

        order.orderStatus = req.body.status;

        if (req.body.status === "Delivered") {
            order.deliveredAt = Date.now();
            order.orderItems.forEach(async (ord) => {
                await updateStock(ord.product, ord.quantity);
            });
        }

        await order.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

async function updateStock(id, quantity) {
    const product = await Product.findById(id);

    product.Stock -= quantity;

    await product.save({ validateBeforeSave: false });
}




// Delete orders -- ADMIN
exports.deleteOrder = AsyncAwaitError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404).json({
            success: false,
            message: "Order can't remove because not found with this ID"
        })
    }

    await order.remove();

    res.status(200).json({
        success: true,
        message: "Order Deleted Successfully by ADMIN",
        order
    })
})