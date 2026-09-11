import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { handleStripeWebhook } from "./controllers/paymentManagement/paymentController.js";
import { fileURLToPath } from "url";
import { verifyMailer } from "./Email/UserManagement/email.config.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8070;

// ✅ Setup __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Allowed browser origins. CLIENT_URL is the deployed SPA; the localhost
// entries keep dev working. Set EXTRA_ORIGINS (comma-separated) to allow
// Vercel preview deployments, which get a new subdomain per commit.
const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.EXTRA_ORIGINS?.split(",") ?? []),
  "http://localhost:3000",
  "http://localhost:5173",
]
  .filter(Boolean)
  .map((o) => o.trim().replace(/\/$/, ""));

app.use(cors({
  origin(origin, callback) {
    // No Origin header: same-origin, curl, or a server-to-server call.
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      return callback(null, true);
    }
    // Refuse by omitting the CORS headers, not by throwing. Throwing reaches
    // Express's default error handler and surfaces as a 500, which reads like
    // a server fault instead of a misconfigured CLIENT_URL. The browser still
    // blocks the response either way.
    console.warn(
      `[cors] blocked origin: ${origin} (allowed: ${allowedOrigins.join(", ")})`
    );
    return callback(null, false);
  },
  credentials: true
}));

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const URL = process.env.MONGODB_URL;

mongoose
  .connect(URL)
  .then(() => console.log("MongoDB connection successful"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Health check for the host's uptime probe. There is no route at "/", so
// without this a probe pointed at the root would report the service as down.
app.get("/health", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    status: "ok",
    db: states[mongoose.connection.readyState] ?? "unknown",
    uptime: Math.round(process.uptime()),
  });
});

// routes
import userRoutes from "./routes/UserManagement/User.js";
app.use("/user", userRoutes);

import ProductRoutes from "./routes/productManagement/product.js";
app.use("/product", ProductRoutes);

//customization
import customizationRoutes from "./routes/ClothingCustomization/customization.js";
app.use("/customization", customizationRoutes);

import rawRoutes from "./routes/RawManagement/raw.js";
app.use("/raw", rawRoutes);

import supplierMailRoutes from "./routes/suplierManagement/supplierMailRoutes.js";
app.use("/supplier", supplierMailRoutes);

import feedbackRoutes from "./routes/FeedbackManagement/feedback.js";
app.use("/feedback", feedbackRoutes);

import chart from "./routes/piechart/feedback.js"
app.use("/Chart",chart)

// Controllers

import paymentRoutes from "./routes/paymentManagement/payment.js";
app.use("/api/payments", paymentRoutes);

import Order from "./routes/orderManagement/orderRoutes.js";
app.use("/order", Order);

import chatRoutes from "./routes/AI/chat.js";
app.use("/api/chat", chatRoutes);

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await verifyMailer();
});
