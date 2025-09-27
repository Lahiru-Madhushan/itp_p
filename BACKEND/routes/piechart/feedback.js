// routes/piechart/feedback.js
import express from "express";   // <--- you forgot this import
import { getFeedbackStats } from "../../controllers/piechart/feedbackStatsController.js"; 
// ✅ fixed path to the existing controller

const router = express.Router();

router.get("/stats", getFeedbackStats);

export default router;
