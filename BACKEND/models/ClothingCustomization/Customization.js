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

    // optional customizations (now numeric with validation)
    measurements: {
      chest: {
        type: Number,
        min: [20, "Chest size too small"],
        max: [200, "Chest size too large"],
      },
      shoulder: {
        type: Number,
        min: [10, "Shoulder size too small"],
        max: [70, "Shoulder size too large"],
      },
      sleeveLength: {
        type: Number,
        min: [10, "Sleeve length too short"],
        max: [100, "Sleeve length too long"],
      },
      collar: {
        type: Number,
        min: [10, "Collar size too small"],
        max: [60, "Collar size too large"],
      },
      waist: {
        type: Number,
        min: [20, "Waist size too small"],
        max: [200, "Waist size too large"],
      },
      hip: {
        type: Number,
        min: [20, "Hip size too small"],
        max: [200, "Hip size too large"],
      },
      thigh: {
        type: Number,
        min: [10, "Thigh size too small"],
        max: [100, "Thigh size too large"],
      },
      inseam: {
        type: Number,
        min: [10, "Inseam too short"],
        max: [120, "Inseam too long"],
      },
      outseam: {
        type: Number,
        min: [20, "Outseam too short"],
        max: [150, "Outseam too long"],
      },
      frockLength: {
        type: Number,
        min: [20, "Frock length too short"],
        max: [200, "Frock length too long"],
      },
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
 