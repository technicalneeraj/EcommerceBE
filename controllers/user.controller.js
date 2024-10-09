const Product = require("../models/product");
const User = require("../models/user");

const whishlistProductSender = async (req, res) => {
    const productDetails = await Product.find({ _id: { $in: req.user.wishlist } });
    res.status(200).json({ message: "Successfully fetched", data: productDetails });
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

const sendingWishlist=async(req,res)=>{
    res.status(200).json({message:"successfully fetched wishlist details" ,wishlistData:req.user.wishlist});
}

module.exports = { whishlistProductSender, updatingUserWishlist,sendingWishlist };
