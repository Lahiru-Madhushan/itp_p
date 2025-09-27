// controllers/FeedbackManagement/feedbackController.js
import { spawn } from "child_process";
import Feedback from "../../models/FeedbackManagement/Feedback.js";

const runSentimentAnalysis = (text) => {
  return new Promise((resolve, reject) => {
    const process = spawn("python", ["./python/helper.py", text]);

    let result = "";
    process.stdout.on("data", (data) => {
      result += data.toString();
    });

    process.stderr.on("data", (err) => {
      console.error("Python error:", err.toString());
    });

    process.on("close", () => {
      resolve(result.trim()); // "positive" or "negative"
    });
  });
};

// ✅ Add Feedback
export const addFeedback = async (req, res) => {
  try {
    const { reviewerName, email, reviewTitle, detailedFeedback, category, wouldRecommend } = req.body || {};
    const imagePaths = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];

    if (!reviewerName || !email || !reviewTitle || !detailedFeedback) {
      return res.status(400).json({ success: false, message: "All required fields must be filled" });
    }

    // 🆕 Run sentiment analysis
    const sentiment = await runSentimentAnalysis(detailedFeedback);

    const feedback = new Feedback({
      reviewerName,
      email,
      reviewTitle,
      detailedFeedback,
      category,
      wouldRecommend: wouldRecommend === "true" || wouldRecommend === true,
      images: imagePaths,
      sentiment,
    });

    await feedback.save();
    res.status(201).json({ success: true, message: "Feedback submitted successfully", feedback });
  } catch (err) {
    console.error("Error adding feedback:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// controllers/FeedbackManagement/feedbackController.js

export const getFeedbackStats = async (req, res) => {
  try {
    const total = await Feedback.countDocuments();
    const positive = await Feedback.countDocuments({ sentiment: "positive" });
    const negative = await Feedback.countDocuments({ sentiment: "negative" });

    res.json({ total, positive, negative });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
