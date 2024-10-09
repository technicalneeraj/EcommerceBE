const express = require("express");
const { catchAsync } = require("../utils/catchAsync");
const router = express.Router();
const {
  sendingWishlist,
  whishlistProductSender,
  updatingUserWishlist,
} = require("../controllers/user.controller");
const { authMiddleware } = require("../middlewares/authMiddleware");

router
  .get("/wishlist-product", authMiddleware, catchAsync(whishlistProductSender))
  .patch(
    "/updating-user-wishlist/:id",
    authMiddleware,
    catchAsync(updatingUserWishlist)
  )
  .get("/send-wishlist", authMiddleware, catchAsync(sendingWishlist));
module.exports = router;
