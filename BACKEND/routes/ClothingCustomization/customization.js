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
  getCustomizationsByUser,
  cancelCustomization,
  updateCustomization ,
} from "../../controllers/ClothingCustomization/customizationController.js";

const router = express.Router();

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/customizations"); // folder where files will be stored
  },
  filename: (req, file, cb) => {
    // Unique filename: timestamp-originalname
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Customer routes
//router.post("/add", upload.single("designImage"), addCustomization);
router.post("/add", verifyToken, upload.single("designImage"), addCustomization);
router.get("/user/:userId", verifyToken, getCustomizationsByUser); // fetch my customizations
router.delete("/:id", verifyToken, cancelCustomization); // cancel (if Pending)
router.put("/:id", verifyToken, updateCustomization);

// ✅ Admin routes
router.get("/all", verifyToken, getAllCustomizations);
router.get("/:id", verifyToken, getCustomizationById);
router.put("/status/:id", verifyToken, updateCustomizationStatus);
router.delete("/admin/:id", verifyToken, deleteCustomization); // full delete (admin only)

export default router;
