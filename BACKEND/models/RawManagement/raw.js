import mongoose from "mongoose";

const { Schema } = mongoose;

const rawSchema = new Schema(
  {
    name: { type: String, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    suppliers: { type: String, required: true },
    status: { type: String, required: true }
  },
  { timestamps: true }
);

const raw = mongoose.model("raw", rawSchema);
export default raw;
