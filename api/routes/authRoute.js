const express = require("express");
const {
  handleRefreshToken,
  logout,
  updatePassword,
  resetPassword,
  loginAdmin,
  createUser,
} = require("../controllers/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", authMiddleware, isAdmin, createUser);
router.post("/admin-login", loginAdmin);
router.put("/reset-password/:token", resetPassword);
router.put("/password", authMiddleware, updatePassword);
router.get("/refresh", authMiddleware, handleRefreshToken);
router.get("/logout", logout);

module.exports = router;
