import Customization from "../../models/ClothingCustomization/Customization.js";

// ✅ Create customization
export const addCustomization = async (req, res) => {
  try {
    const { productId, options } = req.body;

    if (!productId || !options) {
      return res.status(400).json({ success: false, message: "ProductId and options are required" });
    }

    const newCustomization = new Customization({ productId, options });
    await newCustomization.save();

    res.status(201).json({
      success: true,
      message: "Customization added successfully",
      customization: newCustomization,
    });
  } catch (error) {
    console.error("Error adding customization:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all customizations
export const getAllCustomizations = async (req, res) => {
  try {
    const customizations = await Customization.find().populate("productId", "name category price");
    res.status(200).json(customizations);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get by Product
export const getCustomizationByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const customizations = await Customization.find({ productId });
    if (!customizations.length) {
      return res.status(404).json({ success: false, message: "No customizations found" });
    }
    res.status(200).json(customizations);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update customization
export const updateCustomization = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Customization.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Customization not found" });
    }
    res.status(200).json({ success: true, customization: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete customization
export const deleteCustomization = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Customization.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Customization not found" });
    }
    res.status(200).json({ success: true, message: "Customization deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
