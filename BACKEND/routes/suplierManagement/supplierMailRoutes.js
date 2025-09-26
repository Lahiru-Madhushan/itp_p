import express from "express";
import {
  sendSupplierOrderEmail,
  getAllOrders,
  deleteOrder,
} from "../../controllers/supplierManagement/supplierMailController.js";

const router = express.Router();

router.post("/send", sendSupplierOrderEmail);
router.get("/all", getAllOrders);
router.delete("/:id", deleteOrder);

export default router;
