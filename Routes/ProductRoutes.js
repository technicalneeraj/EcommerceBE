const express = require('express');
const router = express.Router();
const {CatchAsync}=require("../Utils/CatchAsync");
const {upload}=require("../Services/Cloudinary");
const addProductHandler =require("../Controllers/ProductController");

router.post("/add-product", upload.fields([{ name: 'mainImage' }, { name: 'otherImages' }]),CatchAsync(addProductHandler));

module.exports = router;