const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

// change
router.get('/level1', categoryController.getLevel1Categories);
router.get('/level2/:parentId', categoryController.getLevel2Categories);
router.get('/level3/:parentId', categoryController.getLevel3Categories);
// router.get('/categories', categoryController.getAllCategories); 
// router.get('/categories/:parentId', categoryController.getSubCategories); 

// man, shoe ,company , size 
module.exports = router;