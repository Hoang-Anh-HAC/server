const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    filterID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Filter",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Option", optionSchema);
