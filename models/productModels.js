const mongoose = require('mongoose');
const { type } = require('os');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    color: {
        type: String,
    },
    date: {
        type: String,
    },
    time: {
        type: String,
    },
    booked: {
        type: String,
    },
    location: {
        type: String,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        maxLength: [8, "Price can't exceed 8 Characters limit"]
    },
    productRatings: {
        type: Number,
        default: 0
    },
    images: [],

    category: {
        type: String,

    },
    poojaVideo: {
        type: String,

    },
    freeParasad: {
        type: String,

    },
    paidRemedy: {
        type: String,

    },
    Stock: {
        type: Number,
        maxLength: [100, "Stock Limit Full"],
        default: 1
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "user",
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Product", productSchema);
