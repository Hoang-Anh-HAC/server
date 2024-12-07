const mongoose = require("mongoose");

const formadSchema = new mongoose.Schema(
  {
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
    helpOptions: {
      type: String,
      enum: [
        "Báo Giá Sản Phẩm",
        "Hỗ Trợ Lên Dự Án",
        "Hỗ Trợ Tư Vấn Kỹ Thuật, Giải Pháp",
        "Khác",
      ],
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

module.exports = mongoose.model("FormAd", formadSchema);
