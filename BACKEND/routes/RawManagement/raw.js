// backend/routes/RawManagement/rawRoutes.js
import express from "express";
import {
  addRaw,
  getAllRaw,
  updateRaw,
  deleteRaw,
} from "../../controllers/RawManagement/rawController.js";

const router = express.Router();

// Base path = /raw
router.get("/", getAllRaw);                // GET /raw/
router.post("/add", addRaw);               // POST /raw/add
router.put("/update/:id", updateRaw);      // PUT /raw/update/:id
router.delete("/delete/:id", deleteRaw);   // DELETE /raw/delete/:id

export default router;
