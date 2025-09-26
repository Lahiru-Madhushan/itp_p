// controllers/RawManagement/rawController.js
import Raw from "../../models/RawManagement/raw.js";

// Create
export const addRaw = async (req, res) => {
  try {
    const { name, unit, quantity, unitPrice, suppliers, status } = req.body;

    if (!name || !unit || !quantity || !unitPrice || !suppliers || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const totalPrice = Number(quantity) * Number(unitPrice);

    const newRaw = new Raw({
      name,
      unit,
      quantity,
      unitPrice,
      price: totalPrice, // ✅ store calculated
      suppliers,
      status,
    });

    await newRaw.save();
    res.json({ status: "Raw material added", raw: newRaw });
  } catch (err) {
    console.error("Error adding raw material:", err);
    res.status(500).send({ error: err.message });
  }
};

// Read all
export const getAllRaw = async (req, res) => {
  try {
    const raws = await Raw.find();
    res.json(raws);
  } catch (err) {
    console.error("Error fetching raw materials:", err);
    res.status(500).send({ error: err.message });
  }
};

// Update
export const updateRaw = async (req, res) => {
  try {
    const rawId = req.params.id;
    const { name, unit, quantity, unitPrice, suppliers, status } = req.body;

    if (!name || !unit || !quantity || !unitPrice || !suppliers || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const totalPrice = Number(quantity) * Number(unitPrice);

    const updated = await Raw.findByIdAndUpdate(
      rawId,
      { name, unit, quantity, unitPrice, price: totalPrice, suppliers, status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Raw material not found" });
    }

    res.status(200).send({ status: "Raw material updated", raw: updated });
  } catch (err) {
    console.error("Error updating raw material:", err);
    res.status(500).send({ error: err.message });
  }
};

// Delete
export const deleteRaw = async (req, res) => {
  try {
    const rawId = req.params.id;
    await Raw.findByIdAndDelete(rawId);

    res.status(200).send({ status: "Raw material deleted" });
  } catch (err) {
    console.error("Error deleting raw material:", err);
    res.status(500).send({ error: err.message });
  }
};
