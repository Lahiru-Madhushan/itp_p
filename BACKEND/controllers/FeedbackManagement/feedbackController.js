import Feedback from "../../models/FeedbackManagement/Feedback.js";

// ✅ Add Feedback
export const addFeedback = async (req, res) => {
  try {
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
      return res.status(400).json({ success: false, message: "All required fields must be filled" });
    }

    const imagePaths = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];

    const feedback = new Feedback({
      reviewerName,
      email,
      reviewTitle,
      detailedFeedback,
      category,
      wouldRecommend: wouldRecommend === "true" || wouldRecommend === true,
      images: imagePaths,
    });

    await feedback.save();
    res.status(201).json({ success: true, message: "Feedback submitted successfully", feedback });
  } catch (err) {
    console.error("Error adding feedback:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get All
export const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Update
export const updateFeedback = async (req, res) => {
  try {
    const { reviewerName, email, reviewTitle, detailedFeedback, category, wouldRecommend } = req.body || {};

    const imagePaths = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];

    const updated = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        reviewerName,
        email,
        reviewTitle,
        detailedFeedback,
        category,
        wouldRecommend: wouldRecommend === "true" || wouldRecommend === true,
        ...(imagePaths.length > 0 && { images: imagePaths }),
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Feedback not found" });

    res.json({ success: true, message: "Feedback updated", feedback: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Delete
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ success: false, message: "Feedback not found" });

    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Feedback deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
