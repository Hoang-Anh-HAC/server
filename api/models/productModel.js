const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mail: { type: String, lowercase: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const specificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    details: { type: String, required: true },
  },
  { _id: false }
);

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    productID: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    prices: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    images: {
      type: [imageSchema],
      default: [],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    comments: [commentSchema],
    specifications: [specificationSchema],

    seriesID: { type: mongoose.Schema.Types.ObjectId, ref: "Series" },
    categoryID: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brandID: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    optionIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Option" }],

    arrange: {
      type: [String],
      default: [],
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
