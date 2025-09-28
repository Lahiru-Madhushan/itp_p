import React, { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8070";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get(`${API}/api/payments/history`);
        setPayments(res.data.payments || []);
      } catch (err) {
        console.error("Error fetching payments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) return <p className="p-6">Loading payment history...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Payment History</h2>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 border">Transaction ID</th>
              <th className="px-4 py-2 border">User</th>
              <th className="px-4 py-2 border">Amount</th>
              <th className="px-4 py-2 border">Method</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No payments found
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 border text-sm">{p.transactionId}</td>
                  <td className="px-4 py-2 border text-sm">
                    {p.userId?.name || "Unknown"} <br />
                    <span className="text-gray-500">{p.userId?.email}</span>
                  </td>
                  <td className="px-4 py-2 border font-medium">
                    Rs. {p.amount}
                  </td>
                  <td className="px-4 py-2 border">{p.paymentMethod}</td>
                  <td
                    className={`px-4 py-2 border font-semibold ${
                      p.status === "Completed"
                        ? "text-green-600"
                        : p.status === "Failed"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {p.status}
                  </td>
                  <td className="px-4 py-2 border text-sm">
                    {new Date(p.paymentDate).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
