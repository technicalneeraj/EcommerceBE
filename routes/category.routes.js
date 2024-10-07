const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const {upload}=require("../services/cloudinary");

router
.get('/', categoryController.getCategories)
.post('/add', upload.single('image'), categoryController.addCategory)

module.exports = router;