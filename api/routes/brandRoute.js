const express = require("express");
const {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getAllBrand,
  uploadLogo,
} = require("../controllers/brandCtrl.js");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware.js");
const { logoResize, uploadPhoto } = require("../middlewares/uploadImages.js");
const router = express.Router();

router.put(
  "/upload-logo/",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 1),
  uploadLogo
);

router.post("/", authMiddleware, isAdmin, createBrand);
router.put("/:id", authMiddleware, isAdmin, updateBrand);
router.delete("/:id", authMiddleware, isAdmin, deleteBrand);
router.get("/:slug", getBrand);
router.get("/", getAllBrand);

module.exports = router;
