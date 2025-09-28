import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8070;

// ✅ Setup __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cors({
  origin: process.env.CLIENT_URL, // http://localhost:3000
  credentials: true
}));

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const URL = process.env.MONGODB_URL;

mongoose
  .connect(URL)
  .then(() => console.log("MongoDB connection successful"))
  .catch((err) => console.error("MongoDB connection error:", err));

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
import { handleStripeWebhook } from "./controllers/paymentManagement/paymentController.js";
import paymentRoutes from "./routes/paymentManagement/payment.js";
app.use("/api/payments", paymentRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
