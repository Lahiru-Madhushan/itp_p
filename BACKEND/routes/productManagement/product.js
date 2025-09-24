import express from "express";
import upload from "../../middleware/upload.js";
import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addToCart,
  removeFromCart,
} from "../../controllers/productManagement/ProductController.js";

const router = express.Router();

router.post("/addProduct", upload.array("images", 5), addProduct);
router.get("/allProducts", getAllProducts);
router.get("/product/:id", getProductById);
router.put("/updateProduct/:id", upload.array("images", 5), updateProduct);
router.delete("/deleteProduct/:id", deleteProduct);

// ✅ Cart route
router.post("/addToCart", addToCart);
router.post("/removeFromCart", removeFromCart);

export default router;
