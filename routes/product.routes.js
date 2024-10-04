const express = require('express');
const router = express.Router();
const {catchAsync}=require("../utils/catchAsync");
const {upload}=require("../services/cloudinary");
const {getCategoryById,getProductById,getProductsHandler,addProductHandler} =require("../controllers/product.controller");
const {authMiddleware,roleAuthMiddleware} = require('../middlewares/authMiddleware');

router
.post("/", authMiddleware,roleAuthMiddleware("products","post"),upload.fields([{ name: 'mainImage' }, { name: 'otherImages' }]),catchAsync(addProductHandler)) 
.get("/",catchAsync(getProductsHandler)) 
.get("/:id",catchAsync(getProductById)) 
.get("/category/:id",catchAsync(getCategoryById))
module.exports = router;