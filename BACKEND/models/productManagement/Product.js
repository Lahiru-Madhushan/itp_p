// models/ProductManagement/Product.js

import mongoose from "mongoose";

const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: [0, "Price must be a positive number"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    images: [
      {
        type: String, // store URLs or file paths
        trim: true,
      },
    ],

    stockQuantity: {
      type: Number,
      required: true,
      min: [0, "Stock quantity cannot be negative"],
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);
export default Product;
