const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const DatabaseConnection = () => {
  mongoose
    .connect(process.env.DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(`MongoDB Connected with ${data.connection.host}`);
    });
};
module.exports = DatabaseConnection;
