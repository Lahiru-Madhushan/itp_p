// models/ClothingCustomization/Customization.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const customizationSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // type of clothing
    clothingType: {
      type: String,
      enum: ["Shirt", "Trouser", "Frock"],
      required: true,
    },

    // common inputs
    fabric: { type: String, required: true, trim: true },
    fabricColor: { type: String, required: true, trim: true },
    size: { type: String, required: true, trim: true }, // e.g., S, M, L or custom

    // optional customizations
    measurements: {
      chest: String,
      shoulder: String,
      sleeveLength: String,
      collar: String,
      waist: String,
      hip: String,
      thigh: String,
      inseam: String,
      outseam: String,
      frockLength: String,
    },

    // image upload (reference path or cloud URL)
    designImage: { type: String, default: "" },

    // status flow
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Finished"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Customization = mongoose.model("Customization", customizationSchema);
export default Customization;
