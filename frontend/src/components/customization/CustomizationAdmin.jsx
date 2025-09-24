import React, { useEffect, useState } from "react";
import {
  Search,
  Download,
  Trash2,
  Filter,
  Shirt,
  Upload,
} from "lucide-react";
import { generateCustomizationPDF } from "./customizationPDF";

const CustomizationManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // 🔹 Editing states
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);

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

  // 🔹 Search + filter
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

  // 🔹 Open modal for editing
  const handleEdit = (order) => {
    setEditingOrder(order);
    setEditForm({
      fabric: order.fabric || "",
      fabricColor: order.fabricColor || "",
      size: order.size || "",
      measurements: { ...order.measurements },
      designImage: null,
      status: order.status || "Pending",
    });
    setPreviewUrl(
      order.designImage
        ? `http://localhost:8070/uploads/customizations/${order.designImage}`
        : null
    );
  };

  // 🔹 Handle input changes
  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setEditForm((prev) => ({ ...prev, designImage: file }));
      setPreviewUrl(URL.createObjectURL(file));
    } else if (name.startsWith("measurements.")) {
      const key = name.split(".")[1];
      setEditForm((prev) => ({
        ...prev,
        measurements: { ...prev.measurements, [key]: value },
      }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 🔹 Save updates
  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("fabric", editForm.fabric);
      formData.append("fabricColor", editForm.fabricColor);
      formData.append("size", editForm.size);
      formData.append("status", editForm.status);

      Object.entries(editForm.measurements || {}).forEach(([key, val]) =>
        formData.append(`measurements[${key}]`, val)
      );
      if (editForm.designImage) {
        formData.append("designImage", editForm.designImage);
      }

      await fetch(`http://localhost:8070/customization/${editingOrder._id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      setOrders((prev) =>
        prev.map((o) =>
          o._id === editingOrder._id ? { ...o, ...editForm } : o
        )
      );

      setEditingOrder(null);
    } catch (error) {
      console.error("Error updating customization:", error);
    }
  };

  const measurementFields = {
    Shirt: ["chest", "shoulder", "sleeveLength", "collar"],
    Trouser: ["waist", "hip", "thigh", "inseam", "outseam"],
    Frock: ["bust", "waist", "hip", "frockLength", "sleeveLength"],
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
        {/* 🔹 Header */}
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

        {/* 🔹 Search & Filter */}
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

        {/* 🔹 Orders Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] max-w-6xl mx-auto table-auto border-collapse text-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Clothing Type</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((o, index) => (
                  <tr
                    key={o._id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100`}
                  >
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 flex justify-center gap-2">
                      <button
                        onClick={() => handleDownloadPDF(o)}
                        className="px-3 py-2 bg-green-500 text-white rounded-md text-xs"
                      >
                        <Download className="h-4 w-4 inline mr-1" /> PDF
                      </button>
                      <button
                        onClick={() => handleEdit(o)}
                        className="px-3 py-2 bg-blue-500 text-white rounded-md text-xs"
                      >
                        ✏️ Update
                      </button>
                      <button
                        onClick={() => handleDelete(o._id)}
                        className="px-3 py-2 bg-red-500 text-white rounded-md text-xs"
                      >
                        <Trash2 className="h-4 w-4 inline mr-1" /> Delete
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

        {/* 🔹 Edit Modal */}
        {editingOrder && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold mb-4">Update Order</h2>

              <input
                type="text"
                name="fabric"
                placeholder="Fabric"
                value={editForm.fabric}
                onChange={handleEditChange}
                className="w-full mb-3 p-2 border rounded"
              />
              <input
                type="text"
                name="fabricColor"
                placeholder="Fabric Color"
                value={editForm.fabricColor}
                onChange={handleEditChange}
                className="w-full mb-3 p-2 border rounded"
              />
              <input
                type="text"
                name="size"
                placeholder="Size"
                value={editForm.size}
                onChange={handleEditChange}
                className="w-full mb-3 p-2 border rounded"
              />

              {/* Measurements */}
              {measurementFields[editingOrder.clothingType]?.map((field) => (
                <input
                  key={field}
                  type="text"
                  name={`measurements.${field}`}
                  placeholder={field}
                  value={editForm.measurements?.[field] || ""}
                  onChange={handleEditChange}
                  className="w-full mb-3 p-2 border rounded"
                />
              ))}

              {/* Upload Design */}
              <div className="mb-3">
                <label className="block mb-2 font-semibold">Upload Design</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditChange}
                  className="mb-2"
                />
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover border rounded"
                  />
                )}
              </div>

              {/* Status */}
              <select
                name="status"
                value={editForm.status}
                onChange={handleEditChange}
                className="w-full mb-4 p-2 border rounded"
              >
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Finished">Finished</option>
              </select>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomizationManagement;
