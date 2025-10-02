import { Router } from "express";
import { getSentimentStats, analyzeOne, analyzeMissing } from "../../controllers/piechart/feedbackStatsController.js";

const router = Router();

router.get("/stats/sentiment", getSentimentStats);
router.post("/analyze-one", analyzeOne);
router.post("/analyze-missing", analyzeMissing);

export default router;
