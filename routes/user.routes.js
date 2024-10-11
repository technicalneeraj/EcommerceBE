const express = require("express");
const { catchAsync } = require("../utils/catchAsync");
const router = express.Router();
const {
  sendingWishlist,
  whishlistProductSender,
  updatingUserWishlist,
  sendCart,
  addToCart,
  updateCartByItem,
  deleteItemFromWishlist,
  removeFromCartAddToWishlist
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
  .post("/add-to-cart/:id", authMiddleware, catchAsync(addToCart))
  .patch("/update-cart/:id", authMiddleware, catchAsync(updateCartByItem))
  .delete(
    "/remove-from-wishlist/:id",
    authMiddleware,
    catchAsync(deleteItemFromWishlist)
  )
  .patch("/remove-from-cart-add-to-wishlist/:id",
    authMiddleware,
    catchAsync(removeFromCartAddToWishlist)
  )
module.exports = router;
