const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    icon: {
      type: [imageSchema],
      default: [],
    },

    brandIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],
    filterIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Filter" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
