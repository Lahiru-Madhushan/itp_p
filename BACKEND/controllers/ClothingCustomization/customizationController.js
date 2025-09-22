// controllers/ClothingCustomization/customizationController.js
import Customization from "../../models/ClothingCustomization/Customization.js";

// Add customization
export const addCustomization = async (req, res) => {
  try {
    const { clothingType, fabric, fabricColor, size, measurements } = req.body;

    if (!clothingType || !fabric || !fabricColor || !size) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newCustomization = new Customization({
      user: req.userId, // from verifyToken middleware
      clothingType,
      fabric,
      fabricColor,
      size,
      measurements,
      designImage: req.file ? req.file.path : "", // if uploading via multer
    });

    await newCustomization.save();

    res.status(201).json({
      success: true,
      message: "Customization request submitted successfully",
      customization: newCustomization,
    });
  } catch (error) {
    console.error("Error in addCustomization", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all customizations (admin view)
export const getAllCustomizations = async (req, res) => {
  try {
    const customizations = await Customization.find().populate("user", "firstName lastName email");
    res.json(customizations);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single customization
export const getCustomizationById = async (req, res) => {
  try {
    const customization = await Customization.findById(req.params.id).populate("user", "firstName lastName email");
    if (!customization) return res.status(404).json({ success: false, message: "Customization not found" });
    res.json(customization);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update status (admin can accept/finish)
export const updateCustomizationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "Accepted", "Finished"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const customization = await Customization.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!customization) {
      return res.status(404).json({ success: false, message: "Customization not found" });
    }

    res.json({ success: true, message: "Status updated", customization });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete customization
export const deleteCustomization = async (req, res) => {
  try {
    await Customization.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Customization deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
