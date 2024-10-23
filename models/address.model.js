const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  buildingName: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
  },
  street: {
    type: String,
    trim: true,
    required: true,
  },
  city: {
    type: String,
    trim: true,
    required: true,
  },
  state: {
    type: String,
    trim: true,
    required: true,
  },
  postalCode: {
    type: String,
    trim: true,
    required: true,
  },
  country: {
    type: String,
    trim: true,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Address = mongoose.model("Address", AddressSchema);

module.exports = Address;
