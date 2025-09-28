import express from "express";
import {
  createCheckoutSession,
  handleStripeWebhook,
  getAllPayments,
} from "../../controllers/paymentManagement/paymentController.js";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);

// Webhook route ⚠️ must use raw body middleware in server.js
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// Admin
router.get("/history", getAllPayments);

export default router;
