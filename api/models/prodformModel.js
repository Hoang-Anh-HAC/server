const mongoose = require("mongoose");

const prodformSchema = new mongoose.Schema(
  {
    prodID: {
      type: String,
      required: true,
    },
    productTitle: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "approved"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProdForm", prodformSchema);
