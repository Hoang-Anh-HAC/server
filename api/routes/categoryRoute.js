const express = require("express");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategory,
  uploadIcon,
} = require("../controllers/categoryCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { iconResize, uploadPhoto } = require("../middlewares/uploadImages");
const router = express.Router();

router.put(
  "/upload-icon/",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 1),
  iconResize,
  uploadIcon
);

router.post("/", authMiddleware, isAdmin, createCategory);
router.put("/:id", authMiddleware, isAdmin, updateCategory);
router.delete("/:id", authMiddleware, isAdmin, deleteCategory);
router.get("/:slug", getCategory);
router.get("/", getAllCategory);

module.exports = router;
