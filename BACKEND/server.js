// server.js (ESM)

import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8070;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

const URL = process.env.MONGODB_URL;

mongoose
  .connect(URL)
  .then(() => {
    console.log("MongoDB connectiomn successful");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// userManagement
import userRoutes from "./routes/UserManagement/User.js";
app.use("/user", userRoutes);









app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
