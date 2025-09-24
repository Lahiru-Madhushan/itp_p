// controllers/RawManagement/rawController.js
import raw from "../../models/RawManagement/raw.js";

// Create
export const addRaw = async (req, res) => {
  try {
    const { name, unit, quantity, price, suppliers, status } = req.body;
    const newRaw = new raw({ name, unit, quantity, price, suppliers, status });

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
    const raws = await raw.find();
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
    const { name, unit, quantity, price, suppliers, status } = req.body;

    const updated = await raw.findByIdAndUpdate(
      rawId,
      { name, unit, quantity, price, suppliers, status },
      { new: true, runValidators: true }
    );

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
    await raw.findByIdAndDelete(rawId);

    res.status(200).send({ status: "Raw material deleted" });
  } catch (err) {
    console.error("Error deleting raw material:", err);
    res.status(500).send({ error: err.message });
  }
};
