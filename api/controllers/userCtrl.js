const { generateToken } = require("../configs/jwtToken");
const { generateTokenRefresh } = require("../configs/tokenRefresh");

const User = require("../models/userModel");

const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const createUser = asyncHandler(async (req, res) => {
  const username = req.body.username;
  const findUser = await User.findOne({ username: username });

  if (!findUser) {
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error("username đã tồn tại!");
  }
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const findAdmin = await User.findOne({ username });
  if (findAdmin.role !== "admin") throw new Error("Not Authorised");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = generateTokenRefresh(findAdmin?.id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Chỉ có thể truy cập qua HTTP, không thể truy cập qua JavaScript
      //   secure: false, // Chỉ nên để true khi bạn sử dụng HTTPS
      maxAge: 72 * 60 * 60 * 1000, // Thời gian sống của cookie
    });

    res.json({
      _id: findAdmin?._id,
      username: findAdmin?.username,
      token: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Tài khoản không tồn tại");
  }
});

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies; // Lấy cookies từ yêu cầu

  if (!cookie?.refreshToken) {
    throw new Error("Không có Refresh Token trong Cookies");
  }

  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });

  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204);
  }

  await User.findOneAndUpdate(
    { refreshToken: refreshToken },
    {
      refreshToken: "",
    }
  );

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204);
});

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  console.log(cookie);
  if (!cookie?.refreshToken)
    throw new Error("Không có Refresh Token trong Cookies");
  const refreshToken = cookie.refreshToken;
  console.log(refreshToken);

  const user = await User.findOne({ refreshToken });
  if (!user)
    throw new Error(
      "Không có Refresh token nào trong db hoặc không trùng khớp"
    );
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("Lỗi ở refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

const deleteaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deleteaUser = await User.findByIdAndDelete(id);
    res.json({
      deleteaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error("Hết hạn Token, vui lòng thử lại");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  res.json(user);
});

module.exports = {
  createUser,
  loginAdmin,
  handleRefreshToken,
  logout,
  resetPassword,
  updatePassword,
  deleteaUser,
};
