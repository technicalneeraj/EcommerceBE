const Category = require("../Models/category");

exports.getLevel1Categories = async (req, res) => {
    try {
        const categories = await Category.find({ level: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching categories' });
    }
};

exports.getLevel2Categories = async (req, res) => {
    try {
        const categories = await Category.find({ parentCategory: req.params.parentId, level: 2 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching categories' });
    }
};

exports.getLevel3Categories = async (req, res) => {
    try {
        const categories = await Category.find({ parentCategory: req.params.parentId, level: 3 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching categories' });
    }
};


