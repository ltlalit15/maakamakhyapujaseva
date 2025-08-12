const Order = require('../models/Admin-OrderModel');
const Cheackout = require('../models/CheackoutModel.js');

const createOrder = async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();

        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const createCheackout = async (req, res) => {
    try {
        const newOrder = new Cheackout(req.body);
        const savedOrder = await newOrder.save();

        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getcheckout = async (req, res) => {
    try {
        const orders = await Cheackout.find();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getOrders,
    createOrder,
    getcheckout,
    createCheackout
}