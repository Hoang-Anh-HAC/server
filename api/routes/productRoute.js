const express = require("express");

const {
  createProduct,
  updateProduct,
  getProduct,
  deleteProduct,
  getAllProduct,
  uploadImages,
  deleteImages,
  updateProductViews,
  toggleProductStatus,
  getProductAdmin,
  getAllProductAdmin,
} = require("../controllers/productCtrl");
const {
  productImgResize,
  uploadPhoto,
} = require("../middlewares/uploadImages");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/admin", authMiddleware, isAdmin, getAllProductAdmin);
router.get("/admin/:slug", authMiddleware, isAdmin, getProductAdmin);

router.get("/:slug", getProduct);
router.get("/", getAllProduct);

router.put(
  "/upload/",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  productImgResize,
  uploadImages
);

router.delete("/delete-img/:id", authMiddleware, isAdmin, deleteImages);

router.post("/", authMiddleware, isAdmin, createProduct);
router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

router.put("/:slug/views", updateProductViews);

router.patch(
  "/:id/toggle-status",
  authMiddleware,
  isAdmin,
  toggleProductStatus
);

module.exports = router;
