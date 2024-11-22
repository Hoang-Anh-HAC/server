const jwt = require("jsonwebtoken");

const generateTokenRefresh = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "3d" });
};

module.exports = { generateTokenRefresh };
