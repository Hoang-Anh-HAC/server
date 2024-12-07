const ProdForm = require("../models/prodformModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId.js");

const createProdForm = asyncHandler(async (req, res) => {
  try {
    const newProdForm = await ProdForm.create(req.body);
    res.json(newProdForm);
  } catch (error) {
    throw new Error(error);
  }
});

const updateProdForm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const updateProdForm = await ProdForm.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateProdForm);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteProdForm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteProdForm = await ProdForm.findByIdAndDelete(id);
    res.json(deleteProdForm);
  } catch (error) {
    throw new Error(error);
  }
});

const getProdForm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaProdForm = await ProdForm.findById(id);
    res.json(getaProdForm);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllProdForm = asyncHandler(async (req, res) => {
  try {
    const totalForms = await ProdForm.countDocuments();
    const pendingForms = await ProdForm.countDocuments({ status: "pending" });
    const getAllProdForm = await ProdForm.find().sort({
      status: -1,
    });
    res.json({
      totalForms,
      pendingForms,
      forms: getAllProdForm,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createProdForm,
  updateProdForm,
  deleteProdForm,
  getProdForm,
  getAllProdForm,
};
