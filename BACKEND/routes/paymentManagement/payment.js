
// routes/paymentManagement/payment.js
import express from "express";
import {
  createCheckoutSession,
  handleStripeWebhook,
  getAllPayments,
  getPaymentSuccessDetails,
  cancelOrder,
  getPaymentById,
  getOrdersByUserId,
  testDatabaseConnection,
  getInvoiceByTransactionId,
  generatePaymentHistoryPDF
} from "../../controllers/paymentManagement/paymentController.js";

const router = express.Router();

// Webhook (must be before express.json())
router.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

// ====== TEST ENDPOINT (move this BEFORE /:id) ======
router.get("/test-db", testDatabaseConnection);

// Regular JSON routes
router.post("/create-checkout-session", createCheckoutSession);
router.get("/success", getPaymentSuccessDetails);
router.post("/cancel", cancelOrder);
router.get("/all", getAllPayments);
router.get("/user-orders/:userId", getOrdersByUserId);
router.get("/invoice/:transactionId", getInvoiceByTransactionId);
router.get("/history/pdf", generatePaymentHistoryPDF);
router.get("/:id", getPaymentById); // <-- keep this at the bottom


export default router;