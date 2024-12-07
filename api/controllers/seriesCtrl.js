const Series = require("../models/seriesModel.js");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId.js");

const createSeries = asyncHandler(async (req, res) => {
  try {
    const newSeries = await Series.create(req.body);
    res.json(newSeries);
  } catch (error) {
    throw new Error(error);
  }
});

const updateSeries = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const updateSeries = await Series.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateSeries);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteSeries = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteSeries = await Series.findByIdAndDelete(id);
    res.json(deleteSeries);
  } catch (error) {
    throw new Error(error);
  }
});

const getSeries = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongoDbId(id);
  try {
    const getaSeries = await Series.findById(id);
    res.json(getaSeries);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllSeries = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const queryObj = { ...req.query };
    const excludeFields = ["page", "limit"];
    excludeFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const total = await Series.countDocuments(JSON.parse(queryStr));
    const getAllSeries = await Series.find(JSON.parse(queryStr))
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: getAllSeries.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: getAllSeries,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createSeries,
  updateSeries,
  deleteSeries,
  getSeries,
  getAllSeries,
};
