import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8070;

app.use(cors({
  origin: process.env.CLIENT_URL, // http://localhost:3000
  credentials: true
}));

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
