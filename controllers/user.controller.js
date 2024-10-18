const Cart = require("../models/cart.model");
const CartItem = require("../models/cartItem.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const Address=require("../models/address.model");

const whishlistProductSender = async (req, res) => {
  const productDetails = await Product.find({
    _id: { $in: req.user.wishlist },
  }).populate("category");
  res
    .status(200)
    .json({ message: "Successfully fetched", data: productDetails });
};
const updatingUserWishlist = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(401).json({ message: "You are not authorized" });
  }

  const product = await Product.findById(id);
  if (!product) {
    return res
      .status(404)
      .json({ message: "Product does not exist in the database" });
  }

  if (!user.wishlist.includes(id)) {
    user.wishlist.push(id);
    await user.save();
    return res.status(200).json({ message: "Product added to wishlist" });
  }
  user.wishlist = user.wishlist.filter((item) => item.toString() !== id);
  await user.save();
  res.status(200).json({ message: "Product removed from wishlist" });
};

const sendingWishlist = async (req, res) => {
  res.status(200).json({
    message: "successfully fetched wishlist details",
    wishlistData: req.user.wishlist,
  });
};

const sendCart = async (req, res) => {
  const userId = req.user.id;
  const cart = await Cart.findOne({ user: userId }).populate({
    path: "cartItems",
    populate: { path: "product", populate: { path: "category" } },
  });
  if (!cart) {
    return res.status(404).json({ message: "The cart is empty" });
  }
  res.status(200).json({ message: "Succesfully fetched", cart });
};

const addToCart = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const userId = req.user.id;

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const value = {
    product: id,
    quantity: data.quantity,
    size: data.size,
    price: product.price,
    userId: userId,
  };

  const itemCart = new CartItem(value);
  await itemCart.save();

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({
      user: userId,
      cartItems: [itemCart._id],
      totalPrice: itemCart.price * itemCart.quantity,
      totalItem: itemCart.quantity,
      totalDiscountPrice:product.discountPrice,
    });
  } else {
    cart.cartItems.push(itemCart._id);
    cart.totalPrice += itemCart.price * itemCart.quantity;
    cart.totalItem += itemCart.quantity;
    cart.totalDiscountPrice+=product.discountPrice;
  }

  await cart.save();

  res.status(201).json({ message: "Item added to cart", cart });
};

const updateCartByItem = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const item = await CartItem.findOne({ _id: id, userId: userId }).populate("product");
  if (!item) {
    return res.status(404).json({ message: "Cart item not found" });
  }
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }
  cart.cartItems = cart.cartItems.filter((item) => {
    return item.toString() !== id.toString();
  });
  cart.totalDiscountPrice-=(item.product.discountPrice *item.quantity);
  cart.totalPrice -=( item.price * item.quantity);
  cart.totalItem -= item.quantity;
  await cart.save();
  await CartItem.deleteOne({ _id: id });
  res.status(200).json({ message: "Cart item removed successfully" });
};

const deleteItemFromWishlist = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const user = await User.findById(userId);
  user.wishlist = user.wishlist.filter((item) => item != id);
  await user.save();
  res.status(200).json({ message: "Succesfully removed from wishlist" });
};

const removeFromCartAddToWishlist = async (req, res) => {
  const { id } = req.params;

  const cartItem = await CartItem.findById(id);
  if (!cartItem) {
    return res.status(404).json({ message: "Cart item not found" });
  }

  const product = await Product.findById(cartItem.product);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (!user.wishlist.includes(product._id)) {
    user.wishlist.push(product._id);
    await user.save();
  }

  const cart = await Cart.findOne({ user: req.user.id });
  cart.totalPrice -= cartItem.quantity * cartItem.price;
  cart.totalItem -= cartItem.quantity;
  cart.totalDiscountPrice-= (cartItem.quantity* product.discountPrice);
  cart.cartItems = cart.cartItems.filter((item) => {
    return item.toString() !== cartItem._id.toString();
  });
  await cart.save();
  await CartItem.findByIdAndDelete(id);

  return res
    .status(200)
    .json({ message: "Product added to wishlist and removed from cart" });
};

const addAddress = async (req, res) => {
  const {
    firstName,
    lastName,
    houseNumber,
    street,
    landmark,
    postalCode,
    city,
    country,
    state,
    phone,
    isDefault,
  } = req.body;
  const newAddress = new Address({
    firstName,
    lastName,
    buildingName: houseNumber,
    street,
    landmark,
    postalCode,
    city,
    country,
    state,
    phone,
    isDefault,
    user: req.user._id,
  });
  const user=await User.findById(req.user._id);
  user.address.push(newAddress._id);
  await newAddress.save();
  await user.save();

  res.status(200).json({message:"Address Successfully Added"});
};

module.exports = {
  updateCartByItem,
  addToCart,
  sendCart,
  whishlistProductSender,
  updatingUserWishlist,
  sendingWishlist,
  deleteItemFromWishlist,
  removeFromCartAddToWishlist,
  addAddress,
};
