// controllers/FeedbackManagement/feedbackController.js
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Feedback from "../../models/FeedbackManagement/Feedback.js";
import User from "../../models/UserManagement/User.js";
import { predictWithPython } from "../../src/services/pythonService.js"; // adjust path if needed

/**
 * A requester may change a review if they own it, or if they are an admin.
 * Reviews created before ownership was tracked have no userId - those are
 * editable by admins only, since there is no owner to verify against.
 */
const canModify = async (feedback, requesterId) => {
  if (feedback.userId && feedback.userId.toString() === requesterId.toString()) {
    return true;
  }
  const requester = await User.findById(requesterId).select("role");
  return requester?.role === "admin";
};

// ✅ Add Feedback (protected - requires verifyToken middleware to have set req.userId)
export const addFeedback = async (req, res) => {
  try {
    // req.userId is set by your verifyToken middleware (cookie-based)
    const requesterId = req.userId;
    if (!requesterId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    const {
      reviewerName,
      email,
      reviewTitle,
      detailedFeedback,
      category,
      wouldRecommend,
    } = req.body || {};

    if (!reviewerName || !email || !reviewTitle || !detailedFeedback) {
      return res
        .status(400)
        .json({ success: false, message: "All required fields must be filled" });
    }

    const imagePaths = req.files
      ? req.files.map((f) => `/uploads/${f.filename}`)
      : [];

    // 🔥 Run Python sentiment analysis (best-effort)
    let sentiment = "unknown";
    try {
      sentiment = await predictWithPython(detailedFeedback || "");
    } catch (err) {
      console.warn("Sentiment analysis failed:", err.message);
    }

    const feedback = new Feedback({
      userId: requesterId, // <-- record the owner
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
    res
      .status(201)
      .json({ success: true, message: "Feedback submitted successfully", feedback });
  } catch (err) {
    console.error("Error adding feedback:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Reads the signed-in user from the cookie without requiring one, so a public
 * route can still tailor its response. Returns null for anonymous visitors.
 */
const optionalUser = async (req) => {
  const token = req.cookies?.token;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId) return null;
    return await User.findById(decoded.userId).select("role");
  } catch {
    return null;
  }
};

// ✅ Get All (public)
export const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();

    // Reviewer email addresses are private. The listing is public, so only an
    // admin ever receives them; everyone else gets the review without it.
    const viewer = await optionalUser(req);
    if (viewer?.role === "admin") return res.json(feedbacks);

    res.json(feedbacks.map(({ email, ...rest }) => rest));
  } catch (err) {
    console.error("getAllFeedback error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Update (protected — only owner can update)
export const updateFeedback = async (req, res) => {
  try {
    const requesterId = req.userId;
    if (!requesterId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid feedback id" });
    }

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    // Ownership check
    if (!(await canModify(feedback, requesterId))) {
      return res
        .status(403)
        .json({ success: false, message: "You can only update your own feedback" });
    }

    const {
      reviewerName,
      email,
      reviewTitle,
      detailedFeedback,
      category,
      wouldRecommend,
    } = req.body || {};

    const imagePaths = req.files
      ? req.files.map((f) => `/uploads/${f.filename}`)
      : [];

    // 🔥 Re-run sentiment analysis if feedback text is updated
    let sentiment;
    if (typeof detailedFeedback !== "undefined" && detailedFeedback !== null) {
      try {
        sentiment = await predictWithPython(detailedFeedback);
      } catch (err) {
        console.warn("Sentiment analysis failed:", err.message);
        sentiment = "unknown";
      }
    }

    const updated = await Feedback.findByIdAndUpdate(
      id,
      {
        // Do NOT allow userId to be changed
        ...(typeof reviewerName !== "undefined" && { reviewerName }),
        ...(typeof email !== "undefined" && { email }),
        ...(typeof reviewTitle !== "undefined" && { reviewTitle }),
        ...(typeof detailedFeedback !== "undefined" && { detailedFeedback }),
        ...(typeof category !== "undefined" && { category }),
        ...(typeof wouldRecommend !== "undefined" && {
          wouldRecommend: wouldRecommend === "true" || wouldRecommend === true,
        }),
        ...(imagePaths.length > 0 && { images: imagePaths }),
        ...(typeof sentiment !== "undefined" && { sentiment }),
      },
      { new: true, runValidators: true }
    );

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Feedback not found after update" });

    res.json({ success: true, message: "Feedback updated", feedback: updated });
  } catch (err) {
    console.error("updateFeedback error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Delete (protected — only owner can delete)
export const deleteFeedback = async (req, res) => {
  try {
    const requesterId = req.userId;
    if (!requesterId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid feedback id" });
    }

    const feedback = await Feedback.findById(id);
    if (!feedback)
      return res
        .status(404)
        .json({ success: false, message: "Feedback not found" });

    // Ownership check
    if (!(await canModify(feedback, requesterId))) {
      return res
        .status(403)
        .json({ success: false, message: "You can only delete your own feedback" });
    }

    await Feedback.findByIdAndDelete(id);
    res.json({ success: true, message: "Feedback deleted" });
  } catch (err) {
    console.error("deleteFeedback error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
