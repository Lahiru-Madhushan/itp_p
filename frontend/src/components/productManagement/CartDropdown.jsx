import React from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8070";

const CartDropdown = ({ cart, onRemove, userId }) => {
  const totalAmount = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  // ✅ Proceed to Stripe Checkout
  const handleCheckout = async () => {
    try {
      if (cart.length === 0) return;

      const firstItem = cart[0]; // for demo; extend to multi-product later

      const res = await axios.post(
        "http://localhost:8070/api/payments/create-checkout-session",
        {
          productId: firstItem._id,
          userId,
          quantity: firstItem.quantity || 1,
        }
      );

      if (res.data.url) {
        window.location.href = res.data.url; // redirect to Stripe Checkout
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to start checkout. Please try again.");
    }
  };

  return (
    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-yellow-300 py-3 z-50 animate-fadeIn sm:rounded-2xl sm:top-full sm:right-0 sm:mt-3 max-sm:fixed max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:z-50 max-sm:rounded-none max-sm:animate-slideIn">
      {/* Header */}
      <div className="flex justify-between items-center px-4 mb-2 border-b pb-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-yellow-500" />
          My Cart
        </h3>
        <button
          className="sm:hidden text-gray-600 hover:text-gray-900 text-xl font-bold"
          onClick={() => window.history.back()}
        >
          ✕
        </button>
      </div>

      {/* Items List */}
      <div className="max-h-60 sm:max-h-80 overflow-y-auto px-4 custom-scrollbar">
        {cart.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-3">🛒 Your cart is empty</p>
            <Link
              to="/products"
              className="text-sm text-yellow-600 hover:underline font-medium"
            >
              Continue Shopping →
            </Link>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between mb-3 border-b pb-2 hover:bg-gray-50 rounded-lg transition"
            >
              {/* Product Info */}
              <div className="flex items-center gap-3">
                <img
                  src={`http://localhost:8070${item.images?.[0] || ""}`}
                  alt={item.name}
                  className="h-12 w-12 object-cover rounded border"
                />
                <div>
                  <p className="font-semibold text-sm text-gray-800">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Rs. {item.price} × {item.quantity || 1} ={" "}
                    <span className="font-medium text-gray-700">
                      Rs. {(item.price || 0) * (item.quantity || 1)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => onRemove(item._id, item.quantity || 1)}
                className="text-red-500 hover:text-red-700 p-1 rounded transition"
                title="Remove item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {cart.length > 0 && (
        <div className="px-4 mt-3 space-y-3">
          <p className="text-right font-bold text-gray-800">
            Total: <span className="text-yellow-600">Rs. {totalAmount}</span>
          </p>
          <button
            onClick={handleCheckout}
            className="block w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-center py-2 rounded-lg font-bold hover:scale-105 hover:shadow-md transition"
          >
            Proceed to Payment
          </button>
        </div>
      )}
    </div>
  );
};

export default CartDropdown;
