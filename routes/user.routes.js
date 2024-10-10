const express = require("express");
const { catchAsync } = require("../utils/catchAsync");
const router = express.Router();
const {
  sendingWishlist,
  whishlistProductSender,
  updatingUserWishlist,
  sendCart,
  addToCart,
  updateCartByItem
} = require("../controllers/user.controller");
const { authMiddleware } = require("../middlewares/authMiddleware");

router
  .get("/wishlist-product", authMiddleware, catchAsync(whishlistProductSender))
  .patch(
    "/updating-user-wishlist/:id",
    authMiddleware,
    catchAsync(updatingUserWishlist)
  )
  .get("/send-wishlist", authMiddleware, catchAsync(sendingWishlist))
  .get("/cart", authMiddleware, catchAsync(sendCart))
  .post("/add-to-cart/:id",authMiddleware, catchAsync(addToCart))
  .patch("/update-cart/:id",authMiddleware,catchAsync(updateCartByItem))
module.exports = router;
