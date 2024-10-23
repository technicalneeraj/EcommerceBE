const Product = require("../models/product.model");
const Category = require("../models/category.model");
const CartItem = require("../models/cartItem.model");
const Cart = require("../models/cart.model");
const User = require("../models/user.model");
const { HTTP_STATUS } = require("../config/constants");
const productSchema = require("../validations/productSchema");

const addProductHandler = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      brand,
      category,
      stock,
      isFeatured,
      status,
      tags,
      P1category,
      P2category,
      attributes,
      sku,
      discountPrice,
    } = req.body;
    const { error } = productSchema.validate({
      price,
      discountPrice,
      name,
      description,
      sku,
      stock,
      isFeatured,
      status,
      category
    });
    if (error) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: error.details[0].message });
    }

    let parsedAttributes = [];

    if (typeof attributes === "string") {
      try {
        const singleAttribute = JSON.parse(attributes);
        parsedAttributes.push(singleAttribute);
      } catch (error) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ error: "Invalid attributes format" });
      }
    } else if (Array.isArray(attributes)) {
      parsedAttributes = attributes
        .map((attr) => {
          try {
            return JSON.parse(attr);
          } catch (error) {
            console.error("Error parsing attribute:", error);
            return null;
          }
        })
        .filter((attr) => attr !== null);
    }

    const mainImage = req.files["mainImage"][0]?.path;
    const otherImages = req.files["otherImages"]
      ? req.files["otherImages"].map((file) => file.path)
      : [];

    const images = [
      { url: mainImage, alt: "Main Image" },
      ...otherImages.map((url) => ({ url, alt: "Other Image" })),
    ];

    let cat = await Category.findOne({
      type: category,
      parent: { $all: [P1category, P2category] },
    });

    if (!cat) {
      const newCategory = {
        type: category,
        parent: [P1category, P2category],
        image: mainImage,
      };
      cat = await Category.create(newCategory);
    }

    const newProduct = new Product({
      name,
      description,
      price,
      brand,
      category: cat._id,
      stock,
      images,
      isFeatured,
      status,
      tags,
      sku,
      attributes:
        parsedAttributes[0].name === "" || parsedAttributes[0].value === ""
          ? []
          : parsedAttributes,
      discountPrice,
    });
    await newProduct.save();

    res
      .status(HTTP_STATUS.CREATED)
      .json({ message: "Product added successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Error adding product" });
  }
};

const getProductsHandler = async (req, res) => {
  const { category } = req.query;
  const categories = await Category.find({ parent: { $in: [category] } });
  const categoryIds = categories.map((category) => category._id);
  const data = await Product.find({ category: categoryIds }).sort({
    createdAt: -1,
  });
  res.status(HTTP_STATUS.OK).json({ message: data });
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate("category");
  if (product) {
    res
      .status(HTTP_STATUS.OK)
      .json({ message: "succesffully founded", product }); // constants
  } else {
    res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ message: "Product with given id not founded" });
  }
};

const getCategoryById = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);

  if (category) {
    res
      .status(HTTP_STATUS.OK)
      .json({ message: "Successfully retrieved category data", category });
  } else {
    res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ message: "No category found for the given ID" });
  }
};

const deleteProductById = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Product does not exist" });
  }

  const cartItemsToDelete = await CartItem.find({ product: id });

  if (cartItemsToDelete.length > 0) {
    //unique ids
    const userIds = [...new Set(cartItemsToDelete.map((item) => item.userId))];

    const carts = await Cart.find({ user: { $in: userIds } });

    for (const cart of carts) {
      cart.cartItems = cart.cartItems.filter(
        (itemId) => !cartItemsToDelete.some((item) => item._id.equals(itemId))
      );

      cart.totalPrice = cart.cartItems.reduce((total, itemId) => {
        const item = cartItemsToDelete.find((cartItem) =>
          cartItem._id.equals(itemId)
        );
        return total + (item ? item.price * item.quantity : 0);
      }, 0);
      cart.totalItem = cart.cartItems.length;
      if (cart.totalItem === 0) {
        await Cart.findByIdAndDelete(cart._id);
      } else {
        await cart.save();
      }
    }

    await CartItem.deleteMany({ product: id });
  }

  // const imagePublicIds = product.images.map(image => image.public_id);
  // await Promise.all(imagePublicIds.map(publicId => deleteImageFromCloudinary(publicId)));
  await Product.findByIdAndDelete(id);

  return res
    .status(HTTP_STATUS.OK)
    .json({ message: "Product successfully deleted" });
};

const updateProductById = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    price,
    brand,
    category,
    P1category,
    P2category,
    stock,
    isFeatured,
    status,
    tags,
    attributes,
    sku,
    discountPrice,
  } = req.body;
  const cat = await Category.findOne({
    type: category,
    parent: { $all: [P1category, P2category] },
  });

  const product = await Product.findById(id);
  product.category = cat._id;
  product.name = name;
  product.brand = brand;
  product.price = price;
  product.status = status;
  product.tags = tags;
  product.stock = stock;
  product.description = description;
  product.isFeatured = isFeatured;
  product.sku = sku;
  product.discountPrice = discountPrice;

  let parsedAttributes = [];

  if (typeof attributes === "string") {
    try {
      const singleAttribute = JSON.parse(attributes);
      parsedAttributes.push(singleAttribute);
    } catch (error) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: "Invalid attributes format" });
    }
  } else if (Array.isArray(attributes)) {
    parsedAttributes = attributes
      .map((attr) => {
        try {
          return JSON.parse(attr);
        } catch (error) {
          console.error("Error parsing attribute:", error);
          return null;
        }
      })
      .filter((attr) => attr !== null);
  }

  product.attributes = parsedAttributes;

  await product.save();
  res.status(HTTP_STATUS.OK).json({ message: "Product successfully updated" });
};

const getProductOfCategory = async (req, res) => {
  const { Pcategory, type } = req.query;
  const categories = await Category.find({
    type: type,
    parent: Pcategory, // Checking if Pcategory is in the parent array
  });
  const categoryIds = categories.map((category) => category._id);
  const products = await Product.find({ category: { $in: categoryIds } });
  res
    .status(HTTP_STATUS.OK)
    .json({ message: "successfully fetched products", products });
};
const isInWishlist = async (req, res) => {
  const { user, product } = req.query;
  const productId = product.toString();
  const theUser = await User.findOne({
    _id: user,
    wishlist: { $in: productId },
  });
  if (theUser) {
    return res.status(HTTP_STATUS.OK).json({ data: "yes" });
  } else {
    return res.status(HTTP_STATUS.OK).json({ data: "no" });
  }
};

const searchHandler = async (req, res) => {
  const { search } = req.query;
  const categories = await Category.find({
    $or: [
      { type: search },
      { type: { $regex: search, $options: "i" } },
      { parent: { $in: search } },
    ],
  });

  const categoryIds = categories.map((category) => category._id);

  const products = await Product.find({
    $or: [
      { name: { $regex: search, $options: "i" } },
      { category: { $in: categoryIds } },
    ],
  }).populate("category");

  res.status(HTTP_STATUS.OK).json(products);
};

module.exports = {
  getCategoryById,
  getProductById,
  addProductHandler,
  getProductsHandler,
  deleteProductById,
  updateProductById,
  getProductOfCategory,
  isInWishlist,
  searchHandler,
};
