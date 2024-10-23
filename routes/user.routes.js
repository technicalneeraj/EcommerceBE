const express = require("express");
const router = express.Router();
const { catchAsync } = require("../utils/catchAsync");

const {
  sendingWishlist,
  whishlistProductSender,
  updatingUserWishlist,
  sendCart,
  addToCart,
  updateCartByItem,
  deleteItemFromWishlist,
  removeFromCartAddToWishlist,
  addAddress,
  updateCartItemSize,
  updateCartItemQuantity,
  createCheckoutSession,
  sendAllOrders,
  updateAddress,
  sendCountOfTotalItemInWishlistAndCart,
  verifyOrder,
} = require("../controllers/user.controller");

const { authMiddleware } = require("../middlewares/authMiddleware");

router
  .post("/verify-order", catchAsync(verifyOrder))
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
  .patch(
    "/remove-from-cart-add-to-wishlist/:id",
    authMiddleware,
    catchAsync(removeFromCartAddToWishlist)
  )
  .post("/address", authMiddleware, catchAsync(addAddress))
  .patch("/address/:id", authMiddleware, catchAsync(updateAddress))
  .patch(
    "/update-cartItem-size/:id",
    authMiddleware,
    catchAsync(updateCartItemSize)
  )
  .patch(
    "/update-cartItem-quantity/:id",
    authMiddleware,
    catchAsync(updateCartItemQuantity)
  )
  .post(
    "/create-checkout-session",
    authMiddleware,
    catchAsync(createCheckoutSession)
  )
  .get("/orders", authMiddleware, catchAsync(sendAllOrders))
  .get(
    "/total-item-in-cart-and-wishilist",
    authMiddleware,
    catchAsync(sendCountOfTotalItemInWishlistAndCart)
  )
  .post("/verify-order", catchAsync(verifyOrder));

module.exports = router;
