const Filter = require("../models/filterModel.js");
const Option = require("../models/optionModel.js");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId.js");

const createFilter = asyncHandler(async (req, res) => {
  try {
    const newFilter = await Filter.create(req.body);
    res.json(newFilter);
  } catch (error) {
    throw new Error(error);
  }
});

const updateFilter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const updateFilter = await Filter.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateFilter);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteFilter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const filter = await Filter.findById(id);
    if (!filter) {
      throw new Error("Không tìm thấy filter");
    }
    await Option.deleteMany({ _id: { $in: filter.optionIDs } });
    // Xóa filter
    const deleteFilter = await Filter.findByIdAndDelete(id);
    res.json(deleteFilter);
  } catch (error) {
    throw new Error(error);
  }
});

const getFilter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaFilter = await Filter.findById(id);
    res.json(getaFilter);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllFilter = asyncHandler(async (req, res) => {
  try {
    const queryObj = { ...req.query };
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Filter.find(JSON.parse(queryStr));

    const getAllFilter = await query.populate("optionIDs", "title");

    res.json(getAllFilter);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createFilter,
  updateFilter,
  deleteFilter,
  getFilter,
  getAllFilter,
};
