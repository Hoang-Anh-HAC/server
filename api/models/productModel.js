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

const detailSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const specificationSchema = new mongoose.Schema(
  {
    topic: { type: String }, // `topic` là không bắt buộc
    details: { type: [detailSchema], required: true }, // `details` vẫn bắt buộc
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
      type: Number,
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
    specifications: [specificationSchema], // `specifications` chứa topic (không bắt buộc) và details (bắt buộc)

    seriesID: { type: mongoose.Schema.Types.ObjectId, ref: "Series" },
    categoryID: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brandID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    optionIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Option" }],
    relatedProducts: [{ type: String, ref: "Product" }],
    matchingProducts: [{ type: String, ref: "Product" }],
    views: {
      type: Number,
      default: 0,
    },

    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
