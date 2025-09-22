import React, { useEffect, useState } from "react";
import { Search, Download, Trash2, Filter, Shirt } from "lucide-react";
import { generateCustomizationPDF } from "./customizationPDF";

const CustomizationManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:8070/customization/all", {
          credentials: "include",
        });
        const data = await res.json();
        setOrders(data.customizations || data); // handle both formats
      } catch (error) {
        console.error("Error fetching customizations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.user?.firstName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.user?.lastName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      typeFilter === "all" ||
      (o.clothingType || "").toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await fetch(`http://localhost:8070/customization/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (error) {
      console.error("Error deleting customization:", error);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await fetch(`http://localhost:8070/customization/status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status } : o))
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDownloadPDF = async (order) => {
    const doc = await generateCustomizationPDF(order);
    doc.save(`Order_${order._id}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shirt className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Customization Management
              </h1>
              <p className="text-gray-600">
                Manage and track all customer clothing orders
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200 appearance-none bg-white min-w-[140px]"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="Shirt">Shirt</option>
                <option value="Trouser">Trouser</option>
                <option value="Frock">Frock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] max-w-6xl mx-auto table-auto border-collapse text-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                    Clothing Type
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((o, index) => (
                  <tr
                    key={o._id}
                    className={`hover:bg-gray-50 transition-colors duration-150 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {o.user?.firstName} {o.user?.lastName}
                    </td>
                    <td className="px-4 py-3">{o.user?.email}</td>
                    <td className="px-4 py-3">{o.user?.phoneNumber}</td>
                    <td className="px-4 py-3">{o.clothingType}</td>
                    <td className="px-4 py-3">{o.size}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) =>
                          handleStatusChange(o._id, e.target.value)
                        }
                        className="border p-1 rounded-lg"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Finished">Finished</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center flex justify-center gap-2">
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
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No orders found
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-4 text-center text-gray-600">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>
    </div>
  );
};

export default CustomizationManagement;
