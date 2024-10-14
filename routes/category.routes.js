const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const {upload}=require("../services/cloudinary");
const {authMiddleware} = require('../middlewares/authMiddleware');


router
.get('/', categoryController.getCategories)
.post('/add', authMiddleware,upload.single('image'), categoryController.addCategory)
.post("/upload-banner", authMiddleware,upload.single('image'),categoryController.uploadBanner)
.get("/banner",categoryController.getBanner)

module.exports = router;