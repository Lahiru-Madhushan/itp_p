import express from "express";
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../../controllers/orderManagement/orderController.js";

const router = express.Router();

router.get("/all", getAllOrders);
router.get("/:id", getOrderById);
router.put("/update/:id", updateOrderStatus);
router.delete("/delete/:id", deleteOrder);

export default router;
