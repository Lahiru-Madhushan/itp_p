// backend/models/ProductManagement/Product.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, unique: true, },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true, maxlength: 1000 },
    images: [{ type: String, trim: true }], // image paths
    stockQuantity: { type: Number, required: true, min: 0 },
  


    size: {
      type: String,
      enum: ["S", "M", "L", "XL", "XXL"], 
      default: "M",
      required: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);
export default Product;
