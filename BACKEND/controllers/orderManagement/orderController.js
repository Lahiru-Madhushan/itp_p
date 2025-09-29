// controllers/orderManagement/orderController.js
import Order from "../../models/orderManagement/Order.js";

// Get All Orders (with user population)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "firstName lastName email phoneNumber address")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "firstName lastName email phoneNumber address"
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Order Status (fix field name)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body; // Changed from 'status' to 'orderStatus'

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: orderStatus }, // Map to correct field
      { new: true, runValidators: true }
    ).populate("userId", "firstName lastName email phoneNumber address");

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete Order
export const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};