import mongoose from "mongoose";

const { Schema } = mongoose;

const FeedbackSchema = new Schema(
  {
    reviewerName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    reviewTitle: { type: String, required: true, trim: true },
    detailedFeedback: { type: String, required: true, minlength: 10 },
    category: {
      type: String,
      enum: ["Product", "Service", "Delivery", "Website", "Other"],
      default: "Other",
    },
    wouldRecommend: { type: Boolean, default: false },
    images: [{ type: String, trim: true }], // "/uploads/file.jpg"

    // ✅ Fix: removed forced default "positive"
    sentiment: { 
      type: String, 
      enum: ["positive", "negative"], 
      default: undefined 
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", FeedbackSchema);
export default Feedback;
