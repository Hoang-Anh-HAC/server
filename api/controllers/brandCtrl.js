const Brand = require("../models/brandModel.js");
const Category = require("../models/categoryModel.js");

const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId.js");
const { cloudinaryUploadImg } = require("../utils/cloudinary.js");
const fs = require("fs");
const slugify = require("slugify");

const createBrand = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }

    const existingBrand = await Brand.findOne({ slug: req.body.slug });
    if (existingBrand) {
      return res.status(400).json({ message: "Thương Hiệu Đã Tồn Tại" });
    }

    const newBrand = await Brand.create(req.body);

    res.status(201).res.json(newBrand);
  } catch (error) {
    throw new Error(error);
  }
});

const uploadLogo = asyncHandler(async (req, res) => {
  try {
    const uploader = (path) => cloudinaryUploadImg(path);

    const urls = [];
    const files = req.files;

    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      urls.push(newpath);
      fs.unlinkSync(path);
    }

    res.status(200).json(urls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }

    const updateBrand = await Brand.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updateBrand) {
      return res.status(404).json({ error: "Sản phẩm không tìm thấy" });
    }
    res.json(updateBrand);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    await Category.updateMany({ brandIDs: id }, { $pull: { brandIDs: id } });

    const deleteBrand = await Brand.findByIdAndDelete(id);

    if (!deleteBrand) {
      return res.status(404).json({ message: "Brand không tồn tại" });
    }

    res.json({ message: "Brand đã được xóa thành công", deleteBrand });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getBrand = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  try {
    const getaBrand = await Brand.findOne({ slug });
    res.json(getaBrand);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllBrand = asyncHandler(async (req, res) => {
  try {
    const queryObj = { ...req.query };
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Brand.find(JSON.parse(queryStr));

    const getAllBrand = await query;
    res.json(getAllBrand);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getAllBrand,
  uploadLogo,
};
