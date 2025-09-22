// routes/ClothingCustomization/customization.js
import express from "express";
import { verifyToken } from "../../middleware/UserManagement/verifyToken.js";
import multer from "multer";

import {
  addCustomization,
  getAllCustomizations,
  getCustomizationById,
  updateCustomizationStatus,
  deleteCustomization,
} from "../../controllers/ClothingCustomization/customizationController.js";

const router = express.Router();

// Multer storage for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/customizations/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// routes
router.post("/add", verifyToken, upload.single("designImage"), addCustomization);
router.get("/all", verifyToken, getAllCustomizations);
router.get("/:id", verifyToken, getCustomizationById);
router.put("/status/:id", verifyToken, updateCustomizationStatus);
router.delete("/:id", verifyToken, deleteCustomization);

export default router;
