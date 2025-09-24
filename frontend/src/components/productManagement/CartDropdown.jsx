// src/components/CartDropdown.jsx
import React from "react";
import { Link } from "react-router-dom";

const CartDropdown = ({ cart, onRemove }) => {
  const totalAmount = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  return (
    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border-2 border-yellow-200 py-3 z-50">
      <h3 className="text-lg font-bold px-4 mb-2">My Cart</h3>

      <div className="max-h-60 overflow-y-auto px-4">
        {cart.length === 0 ? (
          <p className="text-gray-500">Your cart is empty</p>
        ) : (
          cart.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between mb-3 border-b pb-2"
            >
              <div className="flex items-center gap-2">
                <img
                  src={`http://localhost:8070${item.images?.[0] || ""}`}
                  alt={item.name}
                  className="h-12 w-12 object-cover rounded"
                />
                <div>
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    Rs. {item.price} × {item.quantity || 1}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRemove(item._id, item.quantity || 1)}
                className="text-red-500 text-xs"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="px-4 mt-3 space-y-3">
          <p className="text-right font-bold">Total: Rs. {totalAmount}</p>
          <Link
            to="/checkout"
            className="block w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-center py-2 rounded-lg font-bold hover:scale-105 transition"
          >
            Proceed to Payment
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartDropdown;
