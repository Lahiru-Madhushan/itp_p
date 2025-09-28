import express from "express";
import { pay } from "../../controllers/paymentManagement/paymentController.js";

const router = express.Router();

// Payment endpoint
router.post("/pay", pay);

export default router;
