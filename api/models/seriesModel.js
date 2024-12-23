const mongoose = require("mongoose");

const seriesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    brandID: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    categoryID: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Series", seriesSchema);
