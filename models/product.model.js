const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    brand: {
      type: String,
      trim: true
    },
    sku:{
      type:String,
      required:true
    },
    price: {
      type: Number,
      required: true
    },
    discountPrice: {
      type: Number,
      default: 0
    },
    attributes: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true }
      }
    ], // color, size
    stock: {
      type: Number,
      required: true,
      min: 0
    },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String }
      }
    ],
    isFeatured: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'out-of-stock'],
      default: 'active'
    },
    tags: [String],
    ratings: [
      {
        type: Schema.Types.ObjectId,
        ref: "ratings"
      }
    ],
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "reviews"
      }
    ],
    shipping: {
      freeShipping: { type: Boolean, default: false },
      shippingCost: { type: Number, default: 0 }
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("products", productSchema);

module.exports = Product;
