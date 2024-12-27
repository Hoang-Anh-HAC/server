const ProdForm = require("../models/prodformModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId.js");

const sendEmail = require("../utils/sendEmail");

const createProdForm = asyncHandler(async (req, res) => {
  try {
    // Tạo ProdForm mới
    const newProdForm = await ProdForm.create(req.body);

    // Lấy thông tin từ req.body
    const { email, name, message, phone, prodID } = req.body;

    const adminEmail = "hvthang002.work@gmail.com";

    const subject = "HAC - LIÊN HỆ";

    await sendEmail(adminEmail, subject, name, phone, email, message, prodID);

    // Trả về phản hồi thành công
    res.json({
      success: true,
      message: "ProdForm created and notification email sent to admin.",
      data: newProdForm,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
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
