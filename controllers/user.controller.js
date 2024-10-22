const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Cart = require("../models/cart.model");
const CartItem = require("../models/cartItem.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const Address = require("../models/address.model");
const OrderItem = require("../models/orderItem.model");
const Order = require("../models/order.model");
const addressSchema = require("../validations/addressSchema");
const { HTTP_STATUS } = require("../config/constants");

const whishlistProductSender = async (req, res) => {
  const productDetails = await Product.find({
    _id: { $in: req.user.wishlist },
  }).populate("category");
  res
    .status(HTTP_STATUS.OK)
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
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ message: "Product does not exist in the database" });
  }

  if (!user.wishlist.includes(id)) {
    user.wishlist.push(id);
    await user.save();
    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "Product added to wishlist" });
  }
  user.wishlist = user.wishlist.filter((item) => item.toString() !== id);
  await user.save();
  res.status(HTTP_STATUS.OK).json({ message: "Product removed from wishlist" });
};

const sendingWishlist = async (req, res) => {
  res.status(HTTP_STATUS.OK).json({
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
    return res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ message: "The cart is empty" });
  }
  res.status(HTTP_STATUS.OK).json({ message: "Succesfully fetched", cart });
};

const addToCart = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const userId = req.user.id;

  const product = await Product.findById(id);
  if (!product) {
    return res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ message: "Product not found" });
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
      totalDiscountPrice: product.discountPrice * data.quantity,
    });
  } else {
    cart.cartItems.push(itemCart._id);
    cart.totalPrice += itemCart.price * itemCart.quantity;
    cart.totalItem += itemCart.quantity;
    cart.totalDiscountPrice += product.discountPrice * data.quantity;
  }
  await cart.save();
  console.log(cart.totalDiscountPrice);

  res.status(HTTP_STATUS.CREATED).json({ message: "Item added to cart", cart });
};

const updateCartByItem = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const item = await CartItem.findOne({ _id: id, userId: userId }).populate(
    "product"
  );
  if (!item) {
    return res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ message: "Cart item not found" });
  }
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ message: "Cart not found" });
  }
  cart.cartItems = cart.cartItems.filter((item) => {
    return item.toString() !== id.toString();
  });
  cart.totalDiscountPrice -= item.product.discountPrice * item.quantity;
  cart.totalPrice -= item.price * item.quantity;
  cart.totalItem -= item.quantity;
  await cart.save();
  await CartItem.deleteOne({ _id: id });
  res
    .status(HTTP_STATUS.OK)
    .json({ message: "Cart item removed successfully" });
};

const deleteItemFromWishlist = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const user = await User.findById(userId);
  user.wishlist = user.wishlist.filter((item) => item != id);
  await user.save();
  res
    .status(HTTP_STATUS.OK)
    .json({ message: "Succesfully removed from wishlist" });
};

const removeFromCartAddToWishlist = async (req, res) => {
  const { id } = req.params;

  const cartItem = await CartItem.findById(id);
  if (!cartItem) {
    return res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ message: "Cart item not found" });
  }

  const product = await Product.findById(cartItem.product);
  if (!product) {
    return res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ message: "Product not found" });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ message: "User not found" });
  }
  if (!user.wishlist.includes(product._id)) {
    user.wishlist.push(product._id);
    await user.save();
  }

  const cart = await Cart.findOne({ user: req.user.id });
  cart.totalPrice -= cartItem.quantity * cartItem.price;
  cart.totalItem -= cartItem.quantity;
  cart.totalDiscountPrice -= cartItem.quantity * product.discountPrice;
  cart.cartItems = cart.cartItems.filter((item) => {
    return item.toString() !== cartItem._id.toString();
  });
  await cart.save();
  await CartItem.findByIdAndDelete(id);

  return res
    .status(HTTP_STATUS.OK)
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

  const { error } = addressSchema.validate({
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
  });
  if (error) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: error.details[0].message });
  }
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
  const user = await User.findById(req.user._id);
  user.address.push(newAddress._id);
  await newAddress.save();
  await user.save();

  res.status(HTTP_STATUS.OK).json({ message: "Address Successfully Added" });
};

const updateCartItemSize = async (req, res) => {
  const { id } = req.params;
  const { currSize } = req.body;
  const item = await CartItem.findById(id);
  item.size = currSize;
  await item.save();
  res.status(HTTP_STATUS.OK).json({ message: "item update successfully" });
};

const updateCartItemQuantity = async (req, res) => {
  const { id } = req.params;
  const { currQuantity, initialQuantity } = req.body;
  const item = await CartItem.findById(id).populate("product");

  const cart = await Cart.findOne({ user: req.user._id });

  cart.totalPrice -= item.price * initialQuantity;
  cart.totalPrice += item.price * currQuantity;
  cart.totalDiscountPrice -= item.product.discountPrice * initialQuantity;
  cart.totalDiscountPrice += item.product.discountPrice * currQuantity;
  cart.totalItem -= Number(initialQuantity);
  cart.totalItem += Number(currQuantity);
  item.quantity = currQuantity;
  await item.save();
  await cart.save();
  res.status(HTTP_STATUS.OK).json({ message: "Quantity updated" });
};

const createCheckoutSession = async (req, res) => {
  const { cart } = req.body;
  const myCart = await Cart.findById(cart._id).populate({
    path: "cartItems",
    populate: {
      path: "product",
    },
  });

  const lineItems = myCart.cartItems.map((item) => ({
    price_data: {
      currency: "inr",
      product_data: {
        name: item.product.name,
      },
      unit_amount: item.product.price * 100,
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: "http://localhost:5173/",
    cancel_url: "http://localhost:5173/cart",
    metadata: {
      cartId: cart._id,
      userId: cart.user.toString(),
    },
  });
  res.status(HTTP_STATUS.OK).json({ id: session.id });
};

const handleCheckoutSessionCompleted = async (req, res) => {
  const session = req.body.data.object;

  const cartId = session.metadata.cartId;
  const cart = await Cart.findById(cartId).populate({
    path: "cartItems",
    populate: {
      path: "product",
    },
  });

  const orderItems = await Promise.all(
    cart.cartItems.map(async (item) => {
      const orderItem = new OrderItem({
        product: item.product,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        userId: item.userId,
      });
      return await orderItem.save();
    })
  );

  const newOrder = new Order({
    user: cart.user,
    orderItems: orderItems.map((orderItem) => orderItem._id),
    totalPrice: cart.totalPrice,
    totaldiscountedprice: cart.totalDiscountPrice,
    totalItem: cart.cartItems.length,
  });

  await newOrder.save();
  await CartItem.deleteMany({ _id: { $in: cart.cartItems } });
  await Cart.findByIdAndDelete(cartId);

  res
    .status(HTTP_STATUS.OK)
    .send("Order created, cart cleared, and cart items deleted.");
};

const sendAllOrders = async (req, res) => {
  const ID = req.user._id;
  const orders = await Order.find({ user: ID });
  res.status(HTTP_STATUS.OK).json({ orders });
};

const updateAddress = async (req, res) => {
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
  const { id } = req.params;
  console.log(id);
  const address = await Address.findById(id);
  address.firstName = firstName;
  address.lastName = lastName;
  address.buildingName = houseNumber;
  address.street = street;
  address.city = city;
  address.postalCode = postalCode;
  address.country = country;
  address.state = state;
  address.phone = phone;
  address.city = city;
  address.isDefault = isDefault;
  address.landmark = landmark;

  await address.save();
  res.status(HTTP_STATUS.OK).json({ message: "Address updated successfully" });
};

module.exports = {
  updateCartItemQuantity,
  updateCartByItem,
  addToCart,
  sendCart,
  whishlistProductSender,
  updatingUserWishlist,
  sendingWishlist,
  deleteItemFromWishlist,
  removeFromCartAddToWishlist,
  addAddress,
  updateCartItemSize,
  createCheckoutSession,
  sendAllOrders,
  handleCheckoutSessionCompleted,
  updateAddress,
};
