const express = require("express");
const router = express.Router();
const { catchAsync } = require("../utils/catchAsync");
const { upload } = require("../services/cloudinary");

const {
  getCategoryById,
  getProductById,
  getProductsHandler,
  addProductHandler,
  deleteProductById,
  updateProductById,
  getProductOfCategory,
  isInWishlist
} = require("../controllers/product.controller");

const {
  authMiddleware,
  roleAuthMiddleware,
} = require("../middlewares/authMiddleware");

router
  .get("/check-is-in-wishlist",catchAsync(isInWishlist))
  .get("/pageCategory", catchAsync(getProductOfCategory))
  .post(
    "/",
    authMiddleware,
    roleAuthMiddleware("products", "post"),
    upload.fields([{ name: "mainImage" }, { name: "otherImages" }]),
    catchAsync(addProductHandler)
  )
  .get("/", catchAsync(getProductsHandler))
  .get("/:id", catchAsync(getProductById))
  .get("/category/:id", catchAsync(getCategoryById))
  .delete(
    "/:id",
    authMiddleware,
    roleAuthMiddleware("products", "delete"),
    catchAsync(deleteProductById)
  )
  .patch(
    "/:id",
    authMiddleware,
    roleAuthMiddleware("products", "put"),
    catchAsync(updateProductById)
  );

module.exports = router;
