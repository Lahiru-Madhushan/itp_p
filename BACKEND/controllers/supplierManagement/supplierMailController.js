import { transporter, FROM } from "../../Email/UserManagement/email.config.js";
import { SUPPLIER_ORDER_TEMPLATE } from "../../Email/supplierManagement/emailTemplatesSupplier.js";
import SupplierOrder from "../../models/supplierManagement/SupplierOrder.js";

export const sendSupplierOrderEmail = async (req, res) => {
  try {
    const { supplierName, email, item, unit, quantity } = req.body;

    if (!supplierName || !email || !item || !unit || !quantity) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // ✅ Save order in DB
    const newOrder = new SupplierOrder({
      supplierName,
      email,
      item,
      unit,
      quantity,
    });

    // ✅ Prepare HTML email
    const html = SUPPLIER_ORDER_TEMPLATE
      .replace("{supplierName}", supplierName)
      .replace("{item}", item)
      .replace("{unit}", unit)
      .replace("{quantity}", quantity);

    try {
      // ✅ Send mail
      const info = await transporter.sendMail({
        from: FROM,
        to: email,
        subject: `Order Request: ${item} (${quantity})`,
        html,
        text: `Hello ${supplierName}, we need ${quantity} units of ${item}. Please confirm availability.`,
        headers: { "X-Category": "Supplier Order" },
      });

      console.log("✅ Supplier order email sent:", info.response);
      newOrder.status = "SENT";
    } catch (err) {
      console.error("❌ Nodemailer error:", err);
      newOrder.status = "FAILED";
    }

    await newOrder.save();

    res.json({
      success: true,
      message: "Supplier order processed",
      order: newOrder,
    });
  } catch (error) {
    console.error("❌ Controller error:", error);
    res.status(500).json({ error: "Server error while sending order email" });
  }
};

// ✅ Get all stored orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await SupplierOrder.find().sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Delete one order record
export const deleteOrder = async (req, res) => {
  try {
    await SupplierOrder.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Order record deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
