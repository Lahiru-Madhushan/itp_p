
import mongoose from "mongoose";
import { predictWithPython } from "../../src/services/pythonService.js"; // adjust path if needed

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
    images: [{ type: String, trim: true }],

    // ✅ unified enum: includes "unknown" for unclassified
    sentiment: {
      type: String,
      enum: ["positive", "negative", "unknown"],
      default: "unknown",
    },
  },
  { timestamps: true }
);

// 🔥 Pre-save hook → auto-run Python sentiment if missing/unknown
FeedbackSchema.pre("save", async function (next) {
  if (!this.sentiment || this.sentiment === "unknown") {
    try {
      const result = await predictWithPython(this.detailedFeedback || "");
      this.sentiment = result || "unknown";
    } catch (err) {
      console.error("⚠️ Sentiment classification failed:", err.message);
      this.sentiment = "unknown";
    }
  }
  next();
});

const Feedback = mongoose.model("Feedback", FeedbackSchema);
export default Feedback;
