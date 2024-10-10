const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/product");
const User = require("../models/user");

const whishlistProductSender = async (req, res) => {
  const productDetails = await Product.find({
    _id: { $in: req.user.wishlist },
  });
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
    });
  } else {
    cart.cartItems.push(itemCart._id);
    cart.totalPrice += itemCart.price * itemCart.quantity;
    cart.totalItem += itemCart.quantity;
  }

  await cart.save();

  res.status(201).json({ message: "Item added to cart", cart });
};

const updateCartByItem = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const item = await CartItem.findOne({ _id: id, userId: userId });
  if (!item) {
    return res.status(404).json({ message: "Cart item not found" });
  }
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }
  cart.cartItems = cart.cartItems.filter((item) => item._id != id);
  console.log(cart);
  cart.totalPrice-=(item.price*item.quantity);
  cart.totalItem-=item.quantity;
  await cart.save();
  await CartItem.deleteOne({ _id: id });
  res.status(200).json({ message: "Cart item removed successfully" });
};

module.exports = {
  updateCartByItem,
  addToCart,
  sendCart,
  whishlistProductSender,
  updatingUserWishlist,
  sendingWishlist,
};
