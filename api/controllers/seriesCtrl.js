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
    const queryObj = { ...req.query };
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const getAllSeries = await Series.find(JSON.parse(queryStr));
    res.json(getAllSeries);
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
