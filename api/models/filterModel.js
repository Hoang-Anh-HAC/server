const mongoose = require("mongoose");

const filterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    optionIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Option" }],
    categoryID: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Filter", filterSchema);
