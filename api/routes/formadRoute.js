const express = require("express");
const {
  createFormAd,
  updateFormAd,
  deleteFormAd,
  getFormAd,
  getAllFormAd,
} = require("../controllers/formadCtrl.js");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware.js");
const router = express.Router();

router.post("/", createFormAd);
router.put("/:id", authMiddleware, isAdmin, updateFormAd);
router.delete("/:id", authMiddleware, isAdmin, deleteFormAd);
router.get("/:id", authMiddleware, isAdmin, getFormAd);
router.get("/", authMiddleware, isAdmin, getAllFormAd);

module.exports = router;
