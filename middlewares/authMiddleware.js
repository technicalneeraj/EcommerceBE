const jwt = require("jsonwebtoken");
const rolesPermissions = require("../config/roleAuth");
const User = require("../models/user.model");
const { HTTP_STATUS } = require("../config/constants");

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({ message: "No token provided, authorization denied." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    req.user = user;
    next();
  } catch (error) {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({ message: "Token is not valid." });
  }
};

const roleAuthMiddleware = (theResource, action) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    if (rolesPermissions[userRole] && rolesPermissions[userRole][theResource]) {
      if (rolesPermissions[userRole][theResource][action]) {
        return next();
      }
    }
    return res
      .status(HTTP_STATUS.FORBIDDEN)
      .json({ message: "You do not have permission to perform this action" });
  };
};

module.exports = { authMiddleware, roleAuthMiddleware };
