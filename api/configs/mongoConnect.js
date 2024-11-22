const mongoose = require("mongoose");

require("dotenv").config();
const uri = process.env.MONGO_URI;

const mongoConnect = () => {
  mongoose
    .connect(uri)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
    });
};

module.exports = mongoConnect;
