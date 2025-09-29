// routes/paymentManagement/payment.js
import express from "express";
import {
  createCheckoutSession,
  handleStripeWebhook,
  getAllPayments,
  getPaymentSuccessDetails,
  cancelOrder,
  getPaymentById,
  getOrdersByUserId
} from "../../controllers/paymentManagement/paymentController.js";

const router = express.Router();

// Webhook (must be before express.json())
router.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

// Regular JSON routes
router.post("/create-checkout-session", createCheckoutSession);
router.get("/success", getPaymentSuccessDetails);
router.post("/cancel", cancelOrder);
router.get("/all", getAllPayments);
router.get("/:id", getPaymentById);
router.get("/user-orders/:userId", getOrdersByUserId);

export default router;