import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import PaymentManagement from "../../models/paymentManagement/paymentManagement.js";
import Product from "../../models/productManagement/Product.js";
import Order from "../../models/orderManagement/Order.js";
import User from "../../models/UserManagement/User.js"; // Add this import
import { v4 as uuidv4 } from "uuid";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ---------------------------------------------
   Create Stripe Checkout Session
--------------------------------------------- */
export const createCheckoutSession = async (req, res) => {
  try {
    const { userId, cart } = req.body;

    console.log("Received checkout request:", { userId, cart });

    if (!cart || cart.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // ✅ Validate userId format and existence
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required. Please log in again." });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format" });
    }

    // Check if user exists in database
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ success: false, message: "User not found. Please log in again." });
    }

    // 1. Calculate total and validate stock
    const orderId = uuidv4();
    let total = 0;

    // Validate stock and calculate total
    for (const item of cart) {
      if (!item.productId) {
        return res.status(400).json({ success: false, message: "Product ID is required for all items" });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
      }

      if (product.stockQuantity < (item.quantity || 1)) {
        return res.status(400).json({ 
          success: false, 
          message: `Not enough stock for ${item.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity || 1}` 
        });
      }

      const itemPrice = item.finalPrice || item.price || 0;
      const itemQuantity = item.quantity || 1;
      total += itemPrice * itemQuantity;
    }

    // 2. Create Order in DB (status Pending until payment succeeds)
    const newOrder = new Order({
      userId: new mongoose.Types.ObjectId(userId),
      items: cart.map(item => ({
        productId: item.productId,
        name: item.name,
        description: item.description || "",
        images: item.images || [],
        price: item.price,
        finalPrice: item.finalPrice || item.price,
        quantity: item.quantity || 1,
        customizations: item.customizations || {}
      })),
      total,
      status: "Pending",
      orderId,
    });

    await newOrder.save();
    console.log("Order created:", newOrder._id);

    // 3. Convert cart to Stripe line_items
    const lineItems = cart.map((item) => {
      const unitAmount = Math.round((item.finalPrice || item.price || 0) * 100);
      
      if (unitAmount <= 0) {
        throw new Error(`Invalid price for item: ${item.name}`);
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            description: (item.description || "").substring(0, 200), // Stripe limit
            images: item.images && item.images.length > 0 
              ? item.images.map(img => 
                  img.startsWith("http") 
                    ? img 
                    : `${process.env.SERVER_URL || "http://localhost:8070"}${img}`
                ).slice(0, 1) // Stripe only uses first image
              : ["https://via.placeholder.com/300"],
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity || 1,
      };
    });

    // 4. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=${newOrder._id}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel?order_id=${newOrder._id}`,
      customer_email: userExists.email, // Pre-fill email
      metadata: {
        userId: userId.toString(),
        orderId: newOrder._id.toString(), // Use MongoDB _id as primary reference
        stripeOrderId: orderId, // Keep UUID for backup
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'LK'], // Add your countries
      },
    });

    console.log("Stripe session created:", session.id);

    return res.status(200).json({ 
      success: true, 
      url: session.url,
      sessionId: session.id,
      orderId: newOrder._id 
    });

  } catch (error) {
    console.error("Stripe session error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to create checkout session" 
    });
  }
};

/* ---------------------------------------------
   Stripe Webhook (update order + save payment)
--------------------------------------------- */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("Webhook received:", event.type);

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const { userId, orderId } = session.metadata;

      console.log("Processing successful payment for order:", orderId);

      // 1. Update Order Status to Paid
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { 
          status: "Paid", 
          paymentId: session.id,
          $set: { // Ensure these fields are set
            userId: new mongoose.Types.ObjectId(userId),
            total: session.amount_total / 100
          }
        },
        { new: true, runValidators: true }
      );

      if (!updatedOrder) {
        console.error("Order not found for ID:", orderId);
        throw new Error(`Order ${orderId} not found`);
      }

      console.log("Order updated successfully:", updatedOrder._id);

      // 2. Save Payment Record
      const newPayment = new PaymentManagement({
        userId: new mongoose.Types.ObjectId(userId),
        amount: session.amount_total / 100,
        paymentMethod: "Credit Card", // You can parse this from session.payment_method_types
        status: "Completed",
        transactionId: session.id,
        paymentDate: new Date(),
        orderId: orderId, // Reference to the order
      });

      await newPayment.save();
      console.log("Payment record saved:", newPayment._id);

      // 3. Decrease Stock for each item in the order
      if (updatedOrder.items && updatedOrder.items.length > 0) {
        for (let item of updatedOrder.items) {
          if (item.productId) {
            await Product.findByIdAndUpdate(
              item.productId,
              { 
                $inc: { stockQuantity: -(item.quantity || 1) } 
              },
              { new: true }
            );
            console.log(`Stock decreased for product: ${item.productId}, quantity: ${item.quantity}`);
          }
        }
      }

      console.log("Webhook processing completed successfully");

    } catch (dbError) {
      console.error("Database operation error in webhook:", dbError);
      // Don't return error to Stripe yet, let them retry
      return res.status(500).json({ 
        received: false, 
        error: dbError.message 
      });
    }
  }

  // Handle other event types if needed
  switch (event.type) {
    case "payment_intent.succeeded":
      console.log("PaymentIntent was successful!");
      break;
    case "payment_intent.payment_failed":
      const paymentIntent = event.data.object;
      console.log("Payment failed:", paymentIntent.last_payment_error?.message);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
};

/* ---------------------------------------------
   Get Payment Success Details
--------------------------------------------- */
export const getPaymentSuccessDetails = async (req, res) => {
  try {
    const { session_id, order_id } = req.query;

    if (!session_id && !order_id) {
      return res.status(400).json({
        success: false,
        message: "Session ID or Order ID is required"
      });
    }

    let order;
    
    if (order_id) {
      order = await Order.findById(order_id)
        .populate("userId", "firstName lastName email phoneNumber address");
    } else if (session_id) {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      order = await Order.findById(session.metadata.orderId)
        .populate("userId", "firstName lastName email phoneNumber address");
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      order,
      message: "Payment completed successfully"
    });

  } catch (error) {
    console.error("Error fetching payment success details:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ---------------------------------------------
   Cancel Order (if payment cancelled)
--------------------------------------------- */
export const cancelOrder = async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required"
      });
    }

    const order = await Order.findByIdAndUpdate(
      order_id,
      { status: "Cancelled" },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order
    });

  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ---------------------------------------------
   Admin: Get All Payments & Orders
--------------------------------------------- */
export const getAllPayments = async (req, res) => {
  try {
    const payments = await PaymentManagement.find()
      .populate("userId", "firstName lastName email")
      .populate("orderId", "orderId items total status")
      .sort({ paymentDate: -1 });

    const orders = await Order.find()
      .populate("userId", "firstName lastName email phoneNumber address")
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalRevenue = payments
      .filter(p => p.status === "Completed")
      .reduce((sum, payment) => sum + payment.amount, 0);

    const pendingOrders = orders.filter(order => order.status === "Pending").length;
    const completedPayments = payments.filter(p => p.status === "Completed").length;

    res.status(200).json({
      success: true,
      count: {
        payments: payments.length,
        orders: orders.length,
        completedPayments,
        pendingOrders
      },
      statistics: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageOrderValue: orders.length > 0 ? Math.round((totalRevenue / orders.length) * 100) / 100 : 0
      },
      payments,
      orders,
    });
  } catch (error) {
    console.error("Get payments error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments and orders",
      error: error.message,
    });
  }
};

/* ---------------------------------------------
   Get Payment by ID
--------------------------------------------- */
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await PaymentManagement.findById(id)
      .populate("userId", "firstName lastName email phoneNumber address")
      .populate("orderId", "orderId items total status createdAt");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ---------------------------------------------
   Get Orders by User ID
--------------------------------------------- */
export const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const orders = await Order.find({ userId })
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};