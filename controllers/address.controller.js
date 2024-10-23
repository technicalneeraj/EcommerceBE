const User = require("../models/user.model");
const Address = require("../models/address.model");
const { HTTP_STATUS } = require("../config/constants");

const removeAddress = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);
  user.address = user.address.filter((ad) => ad != id);
  await user.save();
  await Address.findByIdAndDelete(id);
  res.status(HTTP_STATUS.OK).json({ message: "Address successfully deleted" });
};
const sendAllAddress = async (req, res) => {
  const user = await User.findById(req.user._id).populate("address");
  res.status(HTTP_STATUS.OK).json({ address: user.address });
};

module.exports = { removeAddress, sendAllAddress };
