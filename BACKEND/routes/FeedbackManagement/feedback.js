import express from "express";
import multer from "multer";
import path from "path";
import {
  addFeedback,
  getAllFeedback,
  updateFeedback,
  deleteFeedback,
} from "../../controllers/FeedbackManagement/feedbackController.js";

const router = express.Router();

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Routes
router.post("/add", upload.array("images", 5), addFeedback);
router.get("/all", getAllFeedback);
router.put("/update/:id", upload.array("images", 5), updateFeedback);
router.delete("/delete/:id", deleteFeedback);

export default router;
