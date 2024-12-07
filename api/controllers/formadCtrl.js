const FormAd = require("../models/formadModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId.js");

const createFormAd = asyncHandler(async (req, res) => {
  try {
    const newFormAd = await FormAd.create(req.body);
    res.json(newFormAd);
  } catch (error) {
    throw new Error(error);
  }
});

const updateFormAd = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const updateFormAd = await FormAd.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateFormAd);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteFormAd = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteFormAd = await FormAd.findByIdAndDelete(id);
    res.json(deleteFormAd);
  } catch (error) {
    throw new Error(error);
  }
});

const getFormAd = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaFormAd = await FormAd.findById(id);
    res.json(getaFormAd);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllFormAd = asyncHandler(async (req, res) => {
  try {
    const totalForms = await FormAd.countDocuments();
    const pendingForms = await FormAd.countDocuments({
      status: "pending",
    });
    const getAllFormAd = await FormAd.find().sort({
      status: -1,
    });
    res.json({
      totalForms,
      pendingForms,
      forms: getAllFormAd,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createFormAd,
  updateFormAd,
  deleteFormAd,
  getFormAd,
  getAllFormAd,
};
