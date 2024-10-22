const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    requiredotpExpirationTime: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  otp: {
    type: Number,
    required: true,
  },
  otpAttempts: {
    type: Number,
    default: 0,
  },
  otpExpirationTime: {
    type: Date,
  },
});

const UserRequest = mongoose.model("UserRequest", userSchema);

module.exports = UserRequest;
