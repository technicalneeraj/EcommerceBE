const express = require("express");
const router = express.Router();

const {
  deleteAccountHandler,
  updateProfile,
  verifyToken,
  forgotOtpVerifier,
  signupHandler,
  loginHandler,
  forgotOtpSenderHandler,
  registerOtpValidateHandler,
  changePasswordHandler,
  deleteForEditHandler,
  getUserData,
  logoutHandler,
} = require("../controllers/authentication.controller");

const { catchAsync } = require("../utils/catchAsync");
const { authMiddleware } = require("../middlewares/authMiddleware");

router
  .post("/forgot-OTP-verify", catchAsync(forgotOtpVerifier))
  .post("/um/user-request", catchAsync(signupHandler))
  .post("/um/user/login", catchAsync(loginHandler))
  .post("/forgot-password-otp", catchAsync(forgotOtpSenderHandler))
  .post("/um/user-request/verify-OTP", catchAsync(registerOtpValidateHandler))
  .patch("/change-password", catchAsync(changePasswordHandler))
  .delete("/delete-data-for-edit", catchAsync(deleteForEditHandler))
  .get("/user-data", authMiddleware, catchAsync(getUserData))
  .post("/um/logout", authMiddleware, catchAsync(logoutHandler))
  .get("/api/auth/verify-token", authMiddleware, catchAsync(verifyToken))
  .post("/um/user/update-profile", authMiddleware, catchAsync(updateProfile))
  .delete(
    "/um/deleteAccount",
    authMiddleware,
    catchAsync(deleteAccountHandler)
  );

module.exports = router;
