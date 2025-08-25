const express = require("express");
const app = express();
const serverless = require("serverless-http");


const errorMiddleware = require("./middleware/AsyncAwaitError");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const compression = require("compression");

const cors = require('cors');
const dotenv = require("dotenv")
const path = require("path")

dotenv.config({ path: "backend/config/config.env" });

app.use(compression());
app.use(cors({ origin: "*" }))
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

const product = require("./routes/productRoute");
const user = require("./routes/userRoutes");
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute");
const contact = require("./routes/contactRoutes");
const review = require("./routes/reviewRoutes");



app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);
app.use("/api/v1", require("./routes/Admin-OrderRoute"));
app.use("/api/v1", contact);
app.use("/api/v1", review);


module.exports = app;
