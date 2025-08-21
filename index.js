const app =require("./app")
const dotenv = require("dotenv");
const cloudinary = require("cloudinary");
const multer = require("multer");
const { Cashfree } = require("cashfree-pg");
const DatabaseConnection = require("./config/database");
const uploadSingleImageToCloudinary = require("./middleware/img");
const schema = require("./models/bannerModel");

// Uncaught Exception handling
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception Error`);
    process.exit(1);
});

// Initialize Express app
// Config for PORT and dotenv
dotenv.config({ path: "backend/config/config.env" });

// Database Connection
DatabaseConnection();

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});
// 
// Multer config for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configure Cashfree
Cashfree.XClientId = "8315403a38906d3fc3d064abfa045138";
Cashfree.XClientSecret = "cfsk_ma_prod_bf6964dae51bfd5b09acc1061c35136f_9044ba19";
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

// Banner Routes
app.post("/api/v1/banner", upload.single("image1"), uploadSingleImageToCloudinary, async (req, res) => {
    try {
        const img = req.uploadedImageUrl;
        const data = await schema.create({
            image1: img.url,
            ...req.body
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error creating banner", error: error.message });
    }
});

app.get("/api/v1/banner", async (req, res) => {
    try {
        const data = await schema.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching banners", error: error.message });
    }
});

app.delete("/api/v1/banner/:id", async (req, res) => {
    try {
        const data = await schema.findByIdAndDelete(req.params.id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error deleting banner", error: error.message });
    }
});

// Cashfree Routes
app.post("/api/v1/create-order", (req, res) => {
    const { orderAmount, orderCurrency, orderId, customerId, customerPhone } = req.body;

    const request = {
        order_amount: orderAmount,
        order_currency: orderCurrency || "INR", // Default to INR if missing
        order_id: Date.now().toString(),
        customer_details: {
            customer_id: Date.now().toString(),
            customer_phone: '+911234567890'
        },
        order_meta: {
            return_url: `https://www.mohitbrothers.com/checkout?order_id=${orderId}`
        }
    };

    Cashfree.PGCreateOrder("2023-08-01", request)
        .then((response) => {
            res.status(200).json({
                message: "Order created successfully",
                data: response.data
            });
        })
        .catch((error) => {
            res.status(500).json({
                message: error.response?.data?.message || "Error creating order",
                error: error.response?.data
            });
        });
});

// Start the server
const PORT = process.env.PORT || 8000;
const mainServer = app.listen(PORT, () => {
    console.log(`SERVER IS RUNNING on http://localhost:${PORT}`);
});

// Unhandled Promise Rejection handling
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);
    mainServer.close(() => process.exit(1));
});




