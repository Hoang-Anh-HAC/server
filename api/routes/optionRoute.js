const express = require("express");
const {
  createOption,
  updateOption,
  deleteOption,
  getOption,
  getAllOption,
} = require("../controllers/optionCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createOption);
router.put("/:id", authMiddleware, isAdmin, updateOption);
router.delete("/:id", authMiddleware, isAdmin, deleteOption);
router.get("/:id", getOption);
router.get("/", getAllOption);

module.exports = router;
