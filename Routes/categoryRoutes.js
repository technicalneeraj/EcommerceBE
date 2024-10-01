const express = require('express');
const router = express.Router();
const categoryController = require('../Controllers/categoryController');

router.get('/level1', categoryController.getLevel1Categories);
router.get('/level2/:parentId', categoryController.getLevel2Categories);
router.get('/level3/:parentId', categoryController.getLevel3Categories);

module.exports = router;