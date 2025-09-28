import dotenv from "dotenv";
dotenv.config();

import PaymentManagement from "../../models/paymentManagement/paymentManagement.js";
import Product from "../../models/productManagement/Product.js";
import { v4 as uuidv4 } from "uuid";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// -----------------------------
// Create Stripe Checkout Session
// -----------------------------
export const createCheckoutSession = async (req, res) => {
  try {
    const { productId, userId, quantity = 1 } = req.body;

    // 1. Get product from DB
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.stockQuantity < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough stock available" });
    }

    // 2. Safe image handling (Stripe requires valid HTTPS URLs)
    const imageUrl =
      product.images.length > 0 &&
      product.images[0].startsWith("http")
        ? product.images[0]
        : "https://via.placeholder.com/300";

    // 3. Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd", // ⚠️ change if needed (e.g. "lkr")
            product_data: {
              name: product.name,
              description: product.description,
              images: [imageUrl],
            },
            unit_amount: Math.round(product.price * 100), // cents
          },
          quantity,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      metadata: {
        userId,
        productId,
        quantity,
        transactionId: uuidv4(),
      },
    });

    return res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe session error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// Stripe Webhook (save payment)
// -----------------------------
export const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      try {
        // 1. Save payment to DB
        const newPayment = new PaymentManagement({
          userId: session.metadata.userId,
          amount: session.amount_total / 100,
          paymentMethod: "Credit Card",
          status: "Completed",
          transactionId: session.metadata.transactionId,
        });

        await newPayment.save();

        // 2. Decrease stock
        await Product.findByIdAndUpdate(session.metadata.productId, {
          $inc: { stockQuantity: -session.metadata.quantity },
        });
      } catch (dbError) {
        console.error("Database save error:", dbError.message);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(500).send(`Webhook Error: ${error.message}`);
  }
};

// -----------------------------
// Admin - Get All Payments
// -----------------------------
export const getAllPayments = async (req, res) => {
  try {
    const payments = await PaymentManagement.find()
      .populate("userId", "name email")
      .sort({ paymentDate: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get payments error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};
