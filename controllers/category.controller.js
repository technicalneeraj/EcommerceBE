const Category = require("../models/category");

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching categories' });
    }
};

exports.addCategory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const newCategory = new Category({
      type: req.body.categoryName,
      parent: JSON.parse(req.body.parentCategories),
      image: req.file.path, 
    });

    await newCategory.save();

    res.status(201).json({ message: 'Category added successfully!', category: newCategory });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
