const express = require("express");
const {
  createSeries,
  updateSeries,
  deleteSeries,
  getSeries,
  getAllSeries,
} = require("../controllers/seriesCtrl.js");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware.js");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createSeries);
router.put("/:id", authMiddleware, isAdmin, updateSeries);
router.delete("/:id", authMiddleware, isAdmin, deleteSeries);
router.get("/:id", getSeries);
router.get("/", getAllSeries);

module.exports = router;
