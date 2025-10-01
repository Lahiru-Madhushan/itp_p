// backend/models/supplierManagement/SupplierOrder.js
import mongoose from "mongoose";

const SupplierOrderSchema = new mongoose.Schema({
  supplierName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  item: { type: String, required: true, trim: true },
  unit: { type: String, required: true, trim: true },   // ✅ added
  quantity: { type: Number, required: true },
  status: { type: String, enum: ["SENT", "FAILED"], default: "SENT" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("SupplierOrder", SupplierOrderSchema);
 