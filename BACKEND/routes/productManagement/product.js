// routes/ProductManagement/Product.js (ESM)

import express from "express";
import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../../controllers/productManagement/ProductController.js";

const router = express.Router();

// optional sanity check
console.log("addProduct:", typeof addProduct);

// Routes (no verifyToken)
router.post("/addProduct", addProduct);
router.get("/allProducts", getAllProducts);
router.get("/product/:id", getProductById);
router.put("/updateProduct/:id", updateProduct);
router.delete("/deleteProduct/:id", deleteProduct);

export default router;
