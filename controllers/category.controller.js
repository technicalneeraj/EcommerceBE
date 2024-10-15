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
        $and: [{ parent: p1category }, { parent: p2category }],
      });
      return res.status(200).json(categories);
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching categories" });
  }
};

exports.addCategory = async (req, res) => {
  if (!req.files["image"] || !req.files["bannerImage"]) {
    return res.status(404).json({ message: "Image is required" });
  }
  try {
    const bannerImage = req.files["bannerImage"][0]?.path;
    const categoryName = req.body.categoryName.toLowerCase();
    let parentCategories = JSON.parse(req.body.parentCategories);
    const lowerCaseParentCategories = parentCategories.map((category) =>
      category.toLowerCase()
    );
    const combinedString = `${categoryName},${lowerCaseParentCategories.join(",")}`;
    const newBanner = new Banner({
      image: bannerImage,
      status: req.body.status,
      category: combinedString,
    });
    const response = await newBanner.save();
    const newCategory = new Category({
      type: categoryName,
      parent: JSON.parse(req.body.parentCategories).map((category) =>
        category.toLowerCase()
      ),
      image: req.files["image"][0]?.path,
      bannerId: response._id,
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
  const { category,Pcategory,type } = req.query;
  if(!Pcategory || !type){
  const data = await Banner.find({ category });
  return res.status(200).json(data);
  }
  else{
    const cat=`${type},${Pcategory}`
    const response = await Banner.findOne({ category: { $regex: cat, $options: 'i' } });
    res.status(200).json(response);
  }
  
};
