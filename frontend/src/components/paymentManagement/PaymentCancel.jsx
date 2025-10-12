import React from "react";
import { XCircle } from "lucide-react";

export default function PaymentCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-700 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-4">
          Your payment was not completed. Please try again.
        </p>
        <a
          href="/cart"
          className="mt-6 inline-block px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Back to Cart
        </a>
      </div>
    </div>
  );
}
