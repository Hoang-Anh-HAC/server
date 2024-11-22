const Option = require("../models/optionModel.js");

const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId.js");

const createOption = asyncHandler(async (req, res) => {
  try {
    const newOption = await Option.create(req.body);

    if (req.body.filterID) {
      const Filter = require("../models/filterModel.js");

      await Filter.findByIdAndUpdate(
        req.body.filterID,
        { $push: { optionIDs: newOption._id } },
        { new: true }
      );
    }

    // Trả về Option đã tạo
    res.json(newOption);
  } catch (error) {
    // Xử lý lỗi
    throw new Error(error);
  }
});

const updateOption = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const updateOption = await Option.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateOption);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteOption = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteOption = await Option.findByIdAndDelete(id);
    res.json(deleteOption);
  } catch (error) {
    throw new Error(error);
  }
});

const getOption = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaOption = await Option.findById(id);
    res.json(getaOption);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllOption = asyncHandler(async (req, res) => {
  try {
    const queryObj = { ...req.query };
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Option.find(JSON.parse(queryStr));

    const getAllOption = await query;
    res.json(getAllOption);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createOption,
  updateOption,
  deleteOption,
  getOption,
  getAllOption,
};
