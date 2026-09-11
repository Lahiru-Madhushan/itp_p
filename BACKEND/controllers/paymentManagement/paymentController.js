
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import PaymentManagement from "../../models/paymentManagement/paymentManagement.js";
import Product from "../../models/productManagement/Product.js";
import Order from "../../models/orderManagement/Order.js";
import User from "../../models/UserManagement/User.js";
import { v4 as uuidv4 } from "uuid";
import Stripe from "stripe";

//  New imports from Code 2
import crypto from "crypto";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import { sendPaymentConfirmationEmail } from "../../Email/UserManagement/emailUser.js";

//  Initialize invoice directory
const INVOICE_DIR = path.join(process.cwd(), "invoices");
if (!fs.existsSync(INVOICE_DIR)) {
  fs.mkdirSync(INVOICE_DIR, { recursive: true });
}

// Stripe is optional. new Stripe(undefined) throws, and this module is
// imported by server.js at boot, so an unset key would crash the whole app
// on startup rather than only breaking checkout. Deployments that don't take
// payments can simply leave STRIPE_SECRET_KEY unset.
const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

if (!stripeConfigured) {
  console.warn(
    "[stripe] STRIPE_SECRET_KEY is not set - payment endpoints are disabled."
  );
}

const stripe = stripeConfigured
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

/** Guard for the handlers that actually talk to Stripe. */
const requireStripe = (res) => {
  if (stripe) return true;
  res.status(503).json({
    success: false,
    message: "Payments are not enabled on this server.",
  });
  return false;
};

/* ---------------------------------------------
   Create Stripe Checkout Session
--------------------------------------------- */
export const createCheckoutSession = async (req, res) => {
  if (!requireStripe(res)) return;
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
  if (!requireStripe(res)) return;
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
        orderId: orderId,
      });

      await newPayment.save();
      console.log("Payment record saved:", newPayment._id);

      //  New invoice generation function
      async function generateInvoicePDF({ payment, order, user }) {
        return new Promise((resolve, reject) => {
          try {
            const filename = `invoice_${payment.transactionId}.pdf`;
            const filePath = path.join(INVOICE_DIR, filename);

            const doc = new PDFDocument({ size: "A4", margin: 50 });
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Company Header (matching the report style)
            doc.fontSize(24).font("Helvetica-Bold")
              .fillColor("black")
              .text("YONG", { align: "center" });
            
            doc.fontSize(24).font("Helvetica-Bold")
              .fillColor("#FFA500") // Orange color for SMART
              .text("SMART", { align: "center" });
            
            doc.fontSize(14).font("Helvetica-Bold")
              .fillColor("black")
              .text("Yong Smart (Pvt) LTD", { align: "center" });
            
            doc.fontSize(10)
              .text("281/A Cemetery Road, Sea Road, Matara, Sri Lanka", { align: "center" });
            
            doc.fontSize(10)
              .text("Contact: +94 123 456 789", { align: "center" });
            
            // Separator line
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);
            
            // Invoice title
            doc.fontSize(18).font("Helvetica-Bold")
              .text("INVOICE", { align: "center" });
            doc.moveDown();

            // Invoice details
            const invoiceDate = new Date(payment.paymentDate || Date.now()).toLocaleString();
            doc.fontSize(12)
              .text(`Invoice #: ${payment._id}`, 50, 200)
              .text(`Transaction ID: ${payment.transactionId}`, 50, 220)
              .text(`Invoice Date: ${invoiceDate}`, 50, 240)
              .text(`Order ID: ${order?.orderId || order?._id}`, 50, 260);

            // Customer Info
            doc.fontSize(12).font("Helvetica-Bold")
              .text("Bill To:", 350, 200);
            doc.fontSize(10).font("Helvetica")
              .text(`${user?.firstName || 'Customer'} ${user?.lastName || ''}`, 350, 220)
              .text(user?.email || 'N/A', 350, 240)
              .text(user?.phoneNumber || 'N/A', 350, 260);

            // Items table
            doc.moveDown(2);
            doc.fontSize(14).font("Helvetica-Bold")
              .text("Items", 50, doc.y);

            let tableTop = doc.y + 20;
            const tableLeft = 50;
            const colWidths = [200, 80, 100, 100];
            const rowHeight = 25;

            // Table headers with yellow background
            doc.rect(tableLeft, tableTop, colWidths.reduce((a, b) => a + b, 0), rowHeight)
              .fill("#FFFF99");
            
            doc.fontSize(10).font("Helvetica-Bold").fillColor("black");
            const headers = ["Description", "Quantity", "Unit Price", "Total"];
            headers.forEach((header, i) => {
              const x = tableLeft + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5;
              doc.text(header, x, tableTop + 8);
            });

            // Table rows
            doc.font("Helvetica").fillColor("black");
            let currentY = tableTop + rowHeight;
            
            if (order?.items?.length) {
              order.items.forEach((item) => {
                const desc = item.name || item.productName || "Item";
                const qty = item.quantity || 1;
                const price = item.finalPrice || item.price || item.unitPrice || 0;
                const total = price * qty;

                // Draw row background
                doc.rect(tableLeft, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight)
                  .fill("#FFFF99");
                
                // Draw row content
                const rowData = [desc, qty.toString(), `Rs. ${price.toFixed(2)}`, `Rs. ${total.toFixed(2)}`];
                rowData.forEach((cell, colIndex) => {
                  const x = tableLeft + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0) + 5;
                  doc.text(cell, x, currentY + 8);
                });
                
                currentY += rowHeight;
              });
            } else {
              // No items row
              doc.rect(tableLeft, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight)
                .fill("#FFFF99");
              doc.text("No item details found.", tableLeft + 5, currentY + 8);
              currentY += rowHeight;
            }

            // Total section
            const grandTotal = order?.total || payment.amount || 0;
            const totalY = currentY + 20;
            
            doc.fontSize(12).font("Helvetica-Bold")
              .text(`Subtotal: Rs. ${grandTotal.toFixed(2)}`, 350, totalY)
              .text(`Total: Rs. ${grandTotal.toFixed(2)}`, 350, totalY + 20);

            // Payment info
            doc.fontSize(10)
              .text(`Payment Method: ${payment.paymentMethod}`, 50, totalY + 50)
              .text(`Payment Status: ${payment.status}`, 50, totalY + 70)
              .text(`Payment Date: ${new Date(payment.paymentDate).toLocaleString()}`, 50, totalY + 90);

            // Footer
            doc.fontSize(8)
              .text("Thank you for your business!", 50, doc.page.height - 100, { align: "center" })
              .text("This invoice was generated automatically", 50, doc.page.height - 80, { align: "center" });

            doc.end();

            stream.on("finish", () => resolve(filePath));
            stream.on("error", (err) => reject(err));
          } catch (err) {
            reject(err);
          }
        });
      }

      // Generate and send invoice after payment is saved
      const userDoc = await User.findById(userId).lean();
      const orderDoc = await Order.findById(orderId).lean();

      try {
        const invoicePath = await generateInvoicePDF({ payment: newPayment, order: orderDoc, user: userDoc });
        console.log("Invoice generated:", invoicePath);

        if (userDoc?.email) {
          // Prepare payment data for email
          const paymentData = {
            customerName: userDoc.name || "Customer",
            transactionId: newPayment.transactionId,
            amount: newPayment.amount,
            paymentMethod: newPayment.paymentMethod,
            paymentDate: new Date(newPayment.paymentDate).toLocaleString()
          };

          // Send payment confirmation email with invoice attachment
          await sendPaymentConfirmationEmail(userDoc.email, paymentData, invoicePath);
          console.log("Payment confirmation email sent to:", userDoc.email);
        }
      } catch (err) {
        console.error("Invoice generation/email failed:", err);
        // Don't fail the webhook if email fails
      }

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
      if (!requireStripe(res)) return;
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
    console.log("Fetching payments...");
    const payments = await PaymentManagement.find()
      .populate("userId", "firstName lastName email")
      .sort({ paymentDate: -1 });
    console.log(`Found ${payments.length} payments`);

    console.log("Fetching orders...");
    const orders = await Order.find()
      .populate("userId", "firstName lastName email phoneNumber address")
      .sort({ createdAt: -1 });
    console.log(`Found ${orders.length} orders`);

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

//  New endpoint from Code 2
export const getInvoiceByTransactionId = async (req, res) => {
  try {
    const { transactionId } = req.params;
    if (!transactionId) return res.status(400).json({ success: false, message: "Transaction ID required" });

    const payment = await PaymentManagement.findOne({ transactionId }).lean();
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    const filePath = path.join(INVOICE_DIR, `invoice_${transactionId}.pdf`);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: "Invoice not found" });

    res.download(filePath);
  } catch (err) {
    console.error("Error sending invoice:", err);
    res.status(500).json({ success: false, message: "Error sending invoice" });
  }
};

// Test endpoint to check database connection
export const testDatabaseConnection = async (req, res) => {
  try {
    console.log("Testing database connection...");
    
    // Test PaymentManagement model
    const paymentCount = await PaymentManagement.countDocuments();
    console.log(`PaymentManagement count: ${paymentCount}`);
    
    // Test Order model
    const orderCount = await Order.countDocuments();
    console.log(`Order count: ${orderCount}`);
    
    // Test User model
    const userCount = await User.countDocuments();
    console.log(`User count: ${userCount}`);
    
    res.status(200).json({
      success: true,
      message: "Database connection successful",
      counts: {
        payments: paymentCount,
        orders: orderCount,
        users: userCount
      }
    });
  } catch (error) {
    console.error("Database connection test failed:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message
    });
  }
};

// Generate Payment History PDF
export const generatePaymentHistoryPDF = async (req, res) => {
  try {
    console.log("Generating payment history PDF...");
    
    // Get all payments with user details
    const payments = await PaymentManagement.find()
      .populate("userId", "firstName lastName email")
      .sort({ paymentDate: -1 });

    // Get orders for additional context
    const orders = await Order.find()
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalRevenue = payments
      .filter(p => p.status === "Completed")
      .reduce((sum, payment) => sum + payment.amount, 0);

    const completedPayments = payments.filter(p => p.status === "Completed").length;
    const pendingPayments = payments.filter(p => p.status === "Pending").length;
    const failedPayments = payments.filter(p => p.status === "Failed").length;

    // Create PDF
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="payment_history_${new Date().toISOString().split('T')[0]}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Company Header
    doc.fontSize(24).font("Helvetica-Bold")
      .fillColor("black")
      .text("YONG", { align: "center" });
    
    doc.fontSize(24).font("Helvetica-Bold")
      .fillColor("#FFA500") // Orange color for SMART
      .text("SMART", { align: "center" });
    
    doc.fontSize(14).font("Helvetica-Bold")
      .fillColor("black")
      .text("Yong Smart (Pvt) LTD", { align: "center" });
    
    doc.fontSize(10)
      .text("281/A Cemetery Road, Sea Road, Matara, Sri Lanka", { align: "center" });
    
    doc.fontSize(10)
      .text("Contact: +94 123 456 789", { align: "center" });
    
    // Separator line
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    
    // Report title
    doc.fontSize(16).font("Helvetica-Bold")
      .text("Payment History Report", { align: "center" });
    doc.moveDown();
    
    // Report info
    doc.fontSize(10)
      .text(`Generated on: ${new Date().toLocaleString()}`)
      .text(`Total Payments: ${payments.length}`)
      .text(`Total Revenue: Rs. ${totalRevenue.toFixed(2)}`)
      .text(`Completed: ${completedPayments} | Pending: ${pendingPayments} | Failed: ${failedPayments}`);
    
    doc.moveDown();

    // Summary table with proper styling
    const summaryData = [
      ["Metric", "Count", "Amount"],
      ["Total Payments", payments.length.toString(), `Rs. ${totalRevenue.toFixed(2)}`],
      ["Completed Payments", completedPayments.toString(), ""],
      ["Pending Payments", pendingPayments.toString(), ""],
      ["Failed Payments", failedPayments.toString(), ""]
    ];

    let tableTop = 280;
    const tableLeft = 50;
    const colWidths = [150, 100, 100];
    const rowHeight = 25;

    // Draw table with yellow header background
    doc.rect(tableLeft, tableTop, colWidths.reduce((a, b) => a + b, 0), rowHeight)
      .fill("#FFFF99"); // Light yellow background for header
    
    // Draw table headers
    doc.fontSize(10).font("Helvetica-Bold").fillColor("black");
    summaryData[0].forEach((header, i) => {
      const x = tableLeft + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5;
      const y = tableTop + 8;
      doc.text(header, x, y);
    });

    // Draw table rows with light yellow background
    doc.font("Helvetica").fillColor("black");
    summaryData.slice(1).forEach((row, rowIndex) => {
      const y = tableTop + rowHeight + (rowIndex * rowHeight);
      
      // Draw row background
      doc.rect(tableLeft, y, colWidths.reduce((a, b) => a + b, 0), rowHeight)
        .fill("#FFFF99");
      
      // Draw row content
      row.forEach((cell, colIndex) => {
        const x = tableLeft + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0) + 5;
        doc.text(cell, x, y + 8);
      });
    });

    // Add payment details on the same page
    doc.moveDown(3);
    doc.fontSize(14).font("Helvetica-Bold")
      .text("Payment Details", 50, doc.y);

    // Create payment details table
    const paymentTableData = [
      ["Transaction ID", "Customer", "Amount", "Method", "Status", "Date"]
    ];

    // Add payment data to table
    console.log(`Processing ${payments.length} payments for PDF`);
    payments.forEach((payment, index) => {
      console.log(`Payment ${index + 1}:`, {
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status,
        userId: payment.userId
      });
      
      const customerName = `${payment.userId?.firstName || 'Unknown'} ${payment.userId?.lastName || ''}`;
      const formattedDate = new Date(payment.paymentDate).toLocaleDateString();
      
      paymentTableData.push([
        payment.transactionId.substring(0, 12) + "...", // Truncate long IDs
        customerName,
        `Rs. ${payment.amount}`,
        payment.paymentMethod,
        payment.status,
        formattedDate
      ]);
    });
    
    console.log(`Payment table data prepared with ${paymentTableData.length - 1} payment records`);

    // Draw payment details table
    const paymentTableTop = doc.y + 20;
    const paymentTableLeft = 50;
    const paymentColWidths = [120, 100, 80, 80, 80, 100];
    const paymentRowHeight = 25;

    // Draw table headers with yellow background
    doc.rect(paymentTableLeft, paymentTableTop, paymentColWidths.reduce((a, b) => a + b, 0), paymentRowHeight)
      .fill("#FFFF99");
    
    doc.fontSize(10).font("Helvetica-Bold").fillColor("black");
    paymentTableData[0].forEach((header, i) => {
      const x = paymentTableLeft + paymentColWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5;
      const y = paymentTableTop + 8;
      doc.text(header, x, y);
    });

    // Draw table rows with alternating colors
    doc.font("Helvetica").fillColor("black");
    
    if (paymentTableData.length <= 1) {
      // No payment data - show message
      const y = paymentTableTop + paymentRowHeight;
      doc.rect(paymentTableLeft, y, paymentColWidths.reduce((a, b) => a + b, 0), paymentRowHeight)
        .fill("#FFFF99");
      doc.text("No payment records found", paymentTableLeft + 5, y + 8);
    } else {
      paymentTableData.slice(1).forEach((row, rowIndex) => {
      const y = paymentTableTop + paymentRowHeight + (rowIndex * paymentRowHeight);
      
      // Check if we need a new page
      if (y > 700) {
        doc.addPage();
        const newY = 100;
        // Redraw headers on new page
        doc.rect(paymentTableLeft, newY, paymentColWidths.reduce((a, b) => a + b, 0), paymentRowHeight)
          .fill("#FFFF99");
        
        doc.fontSize(10).font("Helvetica-Bold").fillColor("black");
        paymentTableData[0].forEach((header, i) => {
          const x = paymentTableLeft + paymentColWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5;
          doc.text(header, x, newY + 8);
        });
        
        // Continue with current row
        const currentY = newY + paymentRowHeight + ((rowIndex % 20) * paymentRowHeight);
        doc.rect(paymentTableLeft, currentY, paymentColWidths.reduce((a, b) => a + b, 0), paymentRowHeight)
          .fill("#FFFF99");
        
        row.forEach((cell, colIndex) => {
          const x = paymentTableLeft + paymentColWidths.slice(0, colIndex).reduce((a, b) => a + b, 0) + 5;
          doc.text(cell, x, currentY + 8);
        });
      } else {
        // Draw row background
        doc.rect(paymentTableLeft, y, paymentColWidths.reduce((a, b) => a + b, 0), paymentRowHeight)
          .fill("#FFFF99");
        
        // Draw row content
        row.forEach((cell, colIndex) => {
          const x = paymentTableLeft + paymentColWidths.slice(0, colIndex).reduce((a, b) => a + b, 0) + 5;
          doc.text(cell, x, y + 8);
        });
      }
    });
    }

    // Footer
    doc.fontSize(8)
      .text("This report was generated automatically by the Payment Management System", 50, doc.page.height - 50, { align: "center" });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error("Error generating payment history PDF:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate payment history PDF",
      error: error.message
    });
  }
};

