// = FILE: frontend/src/pages/AdminOrdersPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Trash2, Download } from "lucide-react";
import { generateOrderPDF } from "./orderPDF";
import { API_ROOT } from "../../lib/api";

const API = API_ROOT;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API}/order/all`);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await axios.delete(`${API}/order/delete/${id}`);
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete order");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`${API}/order/update/${id}`, { orderStatus: status });
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status } : o))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleDownloadPDF = async (order) => {
    const doc = await generateOrderPDF(order);
    doc.save(`Order_${order._id.slice(-6)}.pdf`);
  };

  // ✅ Apply filters
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.userId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o._id?.toLowerCase().includes(searchTerm.toLowerCase());

    const date = new Date(o.createdAt);
    const matchesYear =
      yearFilter === "all" || date.getFullYear().toString() === yearFilter;
    const matchesMonth =
      monthFilter === "all" || (date.getMonth() + 1).toString() === monthFilter;

    return matchesSearch && matchesYear && matchesMonth;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            📦 Order Management
          </h1>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by order ID, name, or email..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Year Filter */}
          <select
            className="pl-3 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="all">All Years</option>
            {[...new Set(orders.map((o) => new Date(o.createdAt).getFullYear()))]
              .sort()
              .map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
          </select>

          {/* Month Filter */}
          <select
            className="pl-3 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          >
            <option value="all">All Months</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(0, m - 1).toLocaleString("default", {
                  month: "long",
                })}
              </option>
            ))}
          </select>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse text-sm">
              <thead className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Products</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-6 text-gray-500 italic"
                    >
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{o._id?.slice(-6)}</td>

                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {o.userId
                            ? `${o.userId.firstName} ${o.userId.lastName}`
                            : "Guest"}
                        </div>
                        <div className="text-xs text-gray-600">
                          {o.userId?.email}
                        </div>
                        <div className="text-xs text-gray-600">
                          {o.userId?.phoneNumber}
                        </div>
                        <div className="text-xs text-gray-600">
                          {o.userId?.address}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {(o.items || []).map((p, idx) => (
                          <div key={idx} className="mb-1">
                            <strong>{p.name}</strong> × {p.quantity} <br />
                            Rs.{p.finalPrice}
                          </div>
                        ))}
                      </td>

                      <td className="px-4 py-3 font-semibold text-yellow-700">
                        Rs. {o.total}
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={o.status}
                          onChange={(e) =>
                            handleStatusChange(o._id, e.target.value)
                          }
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Out for Delivery">
                            Out for Delivery
                          </option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="px-4 py-3">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3 flex justify-center gap-2">
                        <button
                          onClick={() => handleDownloadPDF(o)}
                          className="inline-flex items-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs transition"
                        >
                          <Download className="h-4 w-4 mr-1" /> PDF
                        </button>
                        <button
                          onClick={() => handleDelete(o._id)}
                          className="inline-flex items-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs transition"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
