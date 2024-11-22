const express = require("express");
const {
  createFilter,
  updateFilter,
  deleteFilter,
  getFilter,
  getAllFilter,
} = require("../controllers/filterCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createFilter);
router.put("/:id", authMiddleware, isAdmin, updateFilter);
router.delete("/:id", authMiddleware, isAdmin, deleteFilter);
router.get("/:id", getFilter);
router.get("/", getAllFilter);

module.exports = router;
