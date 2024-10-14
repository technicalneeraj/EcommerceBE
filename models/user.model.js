const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['customer', 'admin', 'vendor'], // constants roles role ={CUSTOMER: }
        default: "customer"
    },
    phone: {
        type: String,
        trim: true
    },
    address: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "addresses"
        }
    ],
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    paymentInformation: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "payment_information"
        }
    ],
    ratings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ratings"
        }
    ],
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "reviews"
        }
    ],
    otpAttempts: { type: Number, default: 0 },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'products' }],
    otp:{type:String},
    otpExpirationTime:{
        type:Date
    },
    refresh_token:String
}, { timestamps: true }); 

const User = mongoose.model("User", userSchema); 

module.exports = User;
