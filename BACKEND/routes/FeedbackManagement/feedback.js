
import express from "express";
import upload from "../../middleware/upload.js";
import { verifyToken } from "../../middleware/authMiddleware.js";

import {
  addFeedback,
  getAllFeedback,
  updateFeedback,
  deleteFeedback,
} from "../../controllers/FeedbackManagement/feedbackController.js";

const router = express.Router();

// Routes
router.post("/add", verifyToken, upload.array("images", 5), addFeedback);
router.get("/all", getAllFeedback);
router.put("/update/:id", verifyToken, upload.array("images", 5), updateFeedback);
router.delete("/delete/:id", verifyToken, deleteFeedback);



export default router;
