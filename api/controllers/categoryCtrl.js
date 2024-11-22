const Category = require("../models/categoryModel.js");
const Brand = require("../models/brandModel.js");
const Filter = require("../models/filterModel.js");

const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId.js");

const fs = require("fs");
const slugify = require("slugify");

const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} = require("../utils/cloudinary.js");

const createCategory = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }

    const existingCategory = await Category.findOne({ slug: req.body.slug });
    if (existingCategory) {
      return res.status(400).json({ message: "Danh mục đã tồn tại" });
    }

    const newCategory = await Category.create(req.body);

    if (req.body.brandIDs && req.body.brandIDs.length > 0) {
      const brandIDs = req.body.brandIDs;

      await Brand.updateMany(
        { _id: { $in: brandIDs } },
        { $push: { categoryIDs: newCategory._id } }
      );

      newCategory.brandIDs = brandIDs;
      await newCategory.save();
    }

    if (req.body.filterIDs && req.body.filterIDs.length > 0) {
      const newfilterIDs = req.body.filterIDs;

      await Filter.updateMany(
        { _id: { $in: newfilterIDs } },
        { $push: { categoryID: newCategory._id } }
      );

      newCategory.filterIDs = newfilterIDs;
      await newCategory.save();
    }

    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const uploadIcon = asyncHandler(async (req, res) => {
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

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (req.body.brandIDs && req.body.brandIDs.length > 0) {
      const newBrandIDs = req.body.brandIDs;

      await Brand.updateMany(
        { categoryIDs: id },
        { $pull: { categoryIDs: id } }
      );

      await Brand.updateMany(
        { _id: { $in: newBrandIDs } },
        { $addToSet: { categoryIDs: id } }
      );

      updatedCategory.brandIDs = newBrandIDs;
      await updatedCategory.save();
    }

    const newfilterIDs = req.body.filterIDs;

    await Filter.updateMany({ categoryID: id }, { $pull: { categoryID: id } });

    await Filter.updateMany(
      { _id: { $in: newfilterIDs } },
      { $addToSet: { categoryID: id } }
    );

    updatedCategory.filterIDs = newfilterIDs;
    await updatedCategory.save();

    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    await Brand.updateMany({ categoryIDs: id }, { $pull: { categoryIDs: id } });
    await Filter.updateMany({ categoryID: id }, { $pull: { categoryID: id } });

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category không tồn tại" });
    }

    res.json({ message: "Category đã được xóa thành công", deletedCategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  try {
    const getaCategory = await Category.findOne({ slug }).populate(
      "filterIDs",
      "title"
    );
    res.json(getaCategory);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllCategory = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("brandIDs", "title logo slug")
      .populate("filterIDs", "title");
    res.json(categories);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategory,
  uploadIcon,
};
