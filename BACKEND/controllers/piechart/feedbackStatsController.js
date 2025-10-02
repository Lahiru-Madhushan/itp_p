import Feedback from "../../models/FeedbackManagement/Feedback.js";
import { predictWithPython } from "../../src/services/pythonService.js";

// GET /api/feedback/stats/sentiment
export const getSentimentStats = async (req, res) => {
  try {
    const agg = await Feedback.aggregate([
      {
        $group: {
          _id: "$sentiment",
          count: { $sum: 1 }
        }
      }
    ]);

    // Normalize to { positive: 0, negative: 0 }
    const stats = { positive: 0, negative: 0, unknown: 0 };
    for (const row of agg) {
      const key = row._id || "unknown";
      if (stats[key] !== undefined) stats[key] = row.count;
      else stats.unknown += row.count;
    }

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to compute stats" });
  }
};

// POST /api/feedback/analyze-one
// body: { id } -> updates the sentiment on that doc
export const analyzeOne = async (req, res) => {
  try {
    const { id } = req.body;
    const fb = await Feedback.findById(id);
    if (!fb) return res.status(404).json({ message: "Feedback not found" });

    const sentiment = await predictWithPython(fb.detailedFeedback || "");
    fb.sentiment = sentiment;
    await fb.save();

    res.json({ id: fb._id, sentiment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to analyze one", error: String(err) });
  }
};

// POST /api/feedback/analyze-missing
// Analyzes only docs where sentiment is not set
export const analyzeMissing = async (req, res) => {
  try {
    const docs = await Feedback.find({ sentiment: { $exists: false } });
    let updated = 0;

    for (const fb of docs) {
      try {
        const sentiment = await predictWithPython(fb.detailedFeedback || "");
        fb.sentiment = sentiment;
        await fb.save();
        updated++;
      } catch (e) {
        console.warn("Analyze error for", fb._id, e?.message);
      }
    }

    res.json({ analyzed: updated, totalMissingAtStart: docs.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to analyze missing", error: String(err) });
  }
};
