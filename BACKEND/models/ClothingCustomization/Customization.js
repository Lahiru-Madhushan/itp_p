import mongoose from "mongoose";

const valueSchema = new mongoose.Schema({
  label: { type: String, required: true },   // e.g. Cotton, Large
  price: { type: Number, required: true, default: 0 }, // extra price
});

const optionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. Fabric Type, Size
  type: { type: String, default: "select" },
  values: [valueSchema],
});

const customizationSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    options: [optionSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Customization", customizationSchema);
