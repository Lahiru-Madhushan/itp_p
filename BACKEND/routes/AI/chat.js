import express from "express";
import { chat } from "../../controllers/AI/chatController.js";

const router = express.Router();

router.post("/", chat);

export default router;
