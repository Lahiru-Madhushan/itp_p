import mongoose from "mongoose";

const customizationSchema = new mongoose.Schema({
  name: String,
  label: String,
  price: Number,
});

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  description: String,
  images: [String],
  price: Number,
  finalPrice: Number,
  quantity: { type: Number, default: 1 },
  customizations: { type: Map, of: customizationSchema },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [orderItemSchema],
    total: Number,
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Out for Delivery", "Cancelled"],
      default: "Pending",
    },
    paymentId: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
