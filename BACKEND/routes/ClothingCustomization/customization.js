import express from "express";
import {
  addCustomization,
  getAllCustomizations,
  getCustomizationByProduct,
  updateCustomization,
  deleteCustomization,
} from "../../controllers/ClothingCustomization/customizationController.js";

const router = express.Router();

// Admin
router.post("/add", addCustomization);
router.get("/all", getAllCustomizations);
router.put("/update/:id", updateCustomization);
router.delete("/delete/:id", deleteCustomization);

// Customer → fetch product customizations
router.get("/product/:productId", getCustomizationByProduct);

export default router;
