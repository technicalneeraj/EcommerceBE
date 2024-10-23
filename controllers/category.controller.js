const Banner = require("../models/banner.model");
const Category = require("../models/category.model");
const { HTTP_STATUS } = require("../config/constants");

exports.getCategories = async (req, res) => {
  const { category, p1category, p2category } = req.query;
  if (category) {
    const categories = await Category.find({ parent: { $in: category } });
    return res.status(HTTP_STATUS.OK).json(categories);
  } else {
    const categories = await Category.find({
      $and: [{ parent: p1category }, { parent: p2category }],
    });
    return res.status(HTTP_STATUS.OK).json(categories);
  }
};

exports.addCategory = async (req, res) => {
  if (!req.files["image"] || !req.files["bannerImage"]) {
    return res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ message: "Image is required" });
  }
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
    .status(HTTP_STATUS.CREATED)
    .json({ message: "Category added successfully!", category: newCategory });
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
  res.status(HTTP_STATUS.OK).json({ message: "Banner successfully uploaded" });
};

exports.getBanner = async (req, res) => {
  const { category, Pcategory, type } = req.query;
  if (!Pcategory || !type) {
    const data = await Banner.find({  category: { $regex:`\\b${category}\\b`, $options: "i" },});
    return res.status(HTTP_STATUS.OK).json(data);
  } else {
    const cat = `${type},${Pcategory}`;
    const response = await Banner.findOne({
      category: { $regex: cat, $options: "i" },
    });
    res.status(HTTP_STATUS.OK).json(response);
  }
};
