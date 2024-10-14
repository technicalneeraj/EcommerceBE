const Banner = require("../models/banner.model");
const Category = require("../models/category.model");

exports.getCategories = async (req, res) => {
  try {
    const { category, p1category, p2category } = req.query;
    if (category) {
      const categories = await Category.find({ parent: { $in: category } });
      return res.status(200).json(categories);
    } else {
      const categories = await Category.find({
        $and:[
          {parent:p1category},
          {parent:p2category}
        ]
      });
      return res.status(200).json(categories);
    }
   
  } catch (error) {
    res.status(500).json({ error: "Error fetching categories" });
  }
};

exports.addCategory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const newCategory = new Category({
      type: req.body.categoryName.toLowerCase(),
      parent: JSON.parse(req.body.parentCategories).map((category) =>
        category.toLowerCase()
      ),
      image: req.file.path,
    });

    await newCategory.save();

    res
      .status(201)
      .json({ message: "Category added successfully!", category: newCategory });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.uploadBanner = async (req, res) => {
  const img = req.file.path;
  const { status, category } = req.body;
  const banner = new Banner({
    image: img,
    status,
    category,
  });
  await banner.save();
  res.status(200).json({ message: "Banner successfully uploaded" });
};

exports.getBanner = async (req, res) => {
  const { category } = req.query;
  const data = await Banner.find({ category });
  res.status(200).json(data);
};
