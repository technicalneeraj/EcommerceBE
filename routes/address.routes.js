const express = require("express");
const router = express.Router();
const { catchAsync } = require("../utils/catchAsync");
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  removeAddress,
  sendAllAddress,
} = require("../controllers/address.controller");

router
  .delete("/:id", authMiddleware, catchAsync(removeAddress))
  .get("/all", authMiddleware, catchAsync(sendAllAddress));

module.exports = router;
