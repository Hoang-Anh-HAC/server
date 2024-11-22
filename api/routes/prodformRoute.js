const express = require("express");
const {
  createProdForm,
  updateProdForm,
  deleteProdForm,
  getProdForm,
  getAllProdForm,
} = require("../controllers/prodformModel");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", createProdForm);
router.put("/:id", authMiddleware, isAdmin, updateProdForm);
router.delete("/:id", authMiddleware, isAdmin, deleteProdForm);
router.get("/:id", authMiddleware, isAdmin, getProdForm);
router.get("/", authMiddleware, isAdmin, getAllProdForm);

module.exports = router;
