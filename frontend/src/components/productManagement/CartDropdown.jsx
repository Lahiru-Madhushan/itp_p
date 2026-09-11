// frontend/src/components/productManagement/CartDropdown.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "../../store/user"; // Adjust path to your store
import { API_ROOT, imageUrl } from "../../lib/api";

const API = API_ROOT;

const CartDropdown = ({ cart, onRemove }) => {
  const navigate = useNavigate();
  
  // Use Zustand store instead of localStorage
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const totalAmount = cart.reduce(
    (sum, item) =>
      sum + (item.finalPrice || item.price || 0) * (item.quantity || 1),
    0
  );

  const handleCheckout = async () => {
    try {
      console.log("Auth status from store:", { 
        isAuthenticated, 
        user,
        userId: user?._id 
      });

      if (!isAuthenticated || !user) {
        alert("Please log in to proceed with checkout");
        navigate("/login", { 
          state: { 
            from: window.location.pathname,
            message: 'Please login to complete your purchase'
          } 
        });
        return;
      }

      const userId = user._id;
      
      if (!userId) {
        alert("User session expired. Please log in again.");
        navigate("/login");
        return;
      }

      if (cart.length === 0) {
        alert("Your cart is empty");
        return;
      }

      // Clean cart for backend
      const cleanedCart = cart.map((item) => ({
        productId: item._id,
        name: item.name,
        description: item.description,
        images: item.images || [],
        price: item.price,
        finalPrice: item.finalPrice || item.price,
        quantity: item.quantity || 1,
        customizations: item.customizations
          ? Object.fromEntries(
              Object.entries(item.customizations).map(([k, v]) => [
                k,
                { label: v.label, price: v.price },
              ])
            )
          : {},
      }));

      console.log("Sending checkout request with:", {
        userId,
        cart: cleanedCart
      });

      const res = await axios.post(
        `${API}/api/payments/create-checkout-session`,
        {
          userId,
          cart: cleanedCart,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Failed to start checkout. Please try again.";
      alert(errorMessage);
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401 || err.response?.status === 400) {
        navigate("/login");
      }
    }
  };

  return (
    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-yellow-300 py-3 z-50">
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

      <div className="max-h-60 sm:max-h-80 overflow-y-auto px-4">
        {cart.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-3">🛒 Your cart is empty</p>
            <Link to="/products" className="text-sm text-yellow-600 hover:underline">
              Continue Shopping →
            </Link>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item._id} className="flex items-center justify-between mb-3 border-b pb-2">
              <div className="flex items-center gap-3">
                <img
                  src={imageUrl(item.images?.[0] || "")}
                  alt={item.name}
                  className="h-12 w-12 object-cover rounded border"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                <div>
                  <p className="font-semibold text-sm">{item.name}</p>
                  {item.customizations && Object.keys(item.customizations).length > 0 && (
                    <ul className="text-xs text-gray-500">
                      {Object.entries(item.customizations).map(([key, val]) => (
                        <li key={key}>
                          {key}: {val.label} (+Rs.{val.price})
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs text-gray-600">
                    Rs. {item.finalPrice || item.price} × {item.quantity} ={" "}
                    <span className="font-medium text-gray-800">
                      Rs. {(item.finalPrice || item.price) * item.quantity}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRemove(item._id, item.quantity)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="px-4 mt-3">
          <p className="text-right font-bold">
            Total: <span className="text-yellow-600">Rs. {totalAmount}</span>
          </p>
          <button
            onClick={handleCheckout}
            disabled={!isAuthenticated || isLoading}
            className={`w-full py-2 mt-2 rounded-lg font-bold transition ${
              !isAuthenticated || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-yellow-500 hover:scale-105'
            }`}
          >
            {isLoading ? 'Processing...' : 'Proceed to Payment'}
          </button>
          {!isAuthenticated && (
            <p className="text-xs text-red-500 text-center mt-2">
              * Please login to checkout
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CartDropdown;