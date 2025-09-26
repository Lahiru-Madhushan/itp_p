import mongoose from "mongoose";

const { Schema } = mongoose;

const rawSchema = new Schema(
  {
    name: { type: String, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true }, // ✅ per unit price
    price: { type: Number, required: true },     // ✅ total = quantity * unitPrice
    suppliers: { type: String, required: true },
    status: { type: String, required: true }
  },
  { timestamps: true }
);

const Raw = mongoose.model("Raw", rawSchema);
export default Raw;
