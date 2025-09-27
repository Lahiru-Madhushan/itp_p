// frontend/src/components/raw/RawManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  Edit3,
  PackagePlus,
  X,
  Download,
  MinusCircle,
} from "lucide-react";
import axiosInstance from "../../lib/axios";
import { generateRawPDF } from "./rawPdf"; // utility for PDF

export default function RawManagement() {
  const [raw, setRaw] = useState([]);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [editingRaw, setEditingRaw] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [usageModal, setUsageModal] = useState(false);
  const [usageValue, setUsageValue] = useState("");
  const [selectedRaw, setSelectedRaw] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    quantity: "",
    unitPrice: "",
    price: "",
    suppliers: "",
    status: "",
  });

  // Load raw materials
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axiosInstance
      .get("/raw")
      .then((res) => setRaw(res.data))
      .catch((err) => console.error("Error fetching raw materials:", err));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    axiosInstance
      .delete(`/raw/delete/${id}`)
      .then(() => {
        alert("✅ Raw material deleted!");
        fetchData();
      })
      .catch((err) => {
        console.error("Delete error:", err);
        alert("❌ Error deleting raw material");
      });
  };

  const openAddModal = () => {
    setEditingRaw(null);
    setFormData({
      name: "",
      unit: "",
      quantity: "",
      unitPrice: "",
      price: "",
      suppliers: "",
      status: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingRaw(item);
    setFormData({
      name: item.name,
      unit: item.unit,
      quantity: item.quantity,
      unitPrice: item.unitPrice || "",
      price: item.price,
      suppliers: item.suppliers,
      status: item.status,
    });
    setModalOpen(true);
  };

  // ✅ Auto-calc total price
  useEffect(() => {
    if (formData.quantity && formData.unitPrice) {
      const total = Number(formData.quantity) * Number(formData.unitPrice);
      setFormData((prev) => ({ ...prev, price: total }));
    }
  }, [formData.quantity, formData.unitPrice]);

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (editingRaw) {
      axiosInstance
        .put(`/raw/update/${editingRaw._id}`, formData)
        .then(() => {
          alert("✅ Raw material updated successfully!");
          setModalOpen(false);
          fetchData();
        })
        .catch((err) => {
          console.error("Update error:", err);
          alert("❌ Error updating raw material");
        });
    } else {
      axiosInstance
        .post("/raw/add", formData)
        .then(() => {
          alert("✅ Raw material added successfully!");
          setModalOpen(false);
          fetchData();
        })
        .catch((err) => {
          console.error("Add error:", err);
          alert("❌ Error adding raw material");
        });
    }
  };

  const formatPrice = (p) => {
    const n = Number(p);
    if (Number.isNaN(n)) return p;
    return `Rs. ${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  // ✅ Handle material usage
  const openUsageModal = (item) => {
    setSelectedRaw(item);
    setUsageValue("");
    setUsageModal(true);
  };

  const handleUseMaterial = () => {
    if (!usageValue || Number(usageValue) <= 0) {
      alert("⚠️ Enter a valid usage amount.");
      return;
    }
    if (Number(usageValue) > selectedRaw.quantity) {
      alert("⚠️ Cannot use more than available stock.");
      return;
    }

    const updatedQuantity = selectedRaw.quantity - Number(usageValue);

    axiosInstance
      .put(`/raw/update/${selectedRaw._id}`, {
        ...selectedRaw,
        quantity: updatedQuantity,
      })
      .then(() => {
        alert("✅ Stock updated after usage!");
        setUsageModal(false);
        fetchData();
      })
      .catch((err) => {
        console.error("Usage error:", err);
        alert("❌ Error updating stock usage");
      });
  };

  // 🔎 Apply filters
  const filtered = raw.filter((r) => {
    const t = `${r.name} ${r.suppliers}`.toLowerCase();
    const okText = t.includes(search.toLowerCase());

    const createdAt = r.createdAt ? new Date(r.createdAt) : null;
    const okYear =
      yearFilter === "all" ||
      (createdAt && createdAt.getFullYear().toString() === yearFilter);
    const okMonth =
      monthFilter === "all" ||
      (createdAt && (createdAt.getMonth() + 1).toString() === monthFilter);

    return okText && okYear && okMonth;
  });

  const uniqueYears = [
    ...new Set(
      raw
        .filter((r) => r.createdAt)
        .map((r) => new Date(r.createdAt).getFullYear().toString())
    ),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <PackagePlus className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              Raw Materials Management
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => generateRawPDF(filtered)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow"
            >
              <Download className="h-4 w-4" /> Download PDF
            </button>
            <button
              onClick={openAddModal}
              className="bg-blue-500 text-white px-5 py-3 rounded-lg shadow hover:bg-blue-600"
            >
              + Add New
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full table-auto text-sm border-collapse">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Unit</th>
                  <th className="px-4 py-3 text-left font-semibold">Quantity</th>
                  <th className="px-4 py-3 text-left font-semibold">Total Price</th>
                  <th className="px-4 py-3 text-left font-semibold">Suppliers</th>
                  <th className="px-4 py-3 text-left font-semibold">Stock Level</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.length > 0 ? (
                  filtered.map((item, index) => {
                    let stockBadge = "";
                    if (item.quantity === 0) {
                      stockBadge = (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">
                          Out of Stock
                        </span>
                      );
                    } else if (item.quantity <= 10) {
                      stockBadge = (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      );
                    } else {
                      stockBadge = (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          In Stock
                        </span>
                      );
                    }

                    return (
                      <tr
                        key={item._id}
                        className={`hover:bg-gray-50 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3">{item.unit}</td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">{formatPrice(item.price)}</td>
                        <td className="px-4 py-3">{item.suppliers}</td>
                        <td className="px-4 py-3">{stockBadge}</td>
                        <td className="px-4 py-3 text-center flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="inline-flex items-center px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-xs transition"
                          >
                            <Edit3 className="h-4 w-4 mr-1" /> Update
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="inline-flex items-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs transition"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </button>
                          <button
                            onClick={() => openUsageModal(item)}
                            className="inline-flex items-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs transition"
                          >
                            <MinusCircle className="h-4 w-4 mr-1" /> Use
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-6 text-gray-500">
                      No raw materials found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Usage Modal */}
        {usageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
              <button
                onClick={() => setUsageModal(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Use Material - {selectedRaw?.name}
              </h2>
              <input
                type="number"
                placeholder="Enter quantity used"
                value={usageValue}
                onChange={(e) => setUsageValue(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleUseMaterial}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setUsageModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingRaw ? "Update Raw Material" : "Add New Raw Material"}
              </h2>

              <form className="grid gap-4" onSubmit={handleFormSubmit}>
                <select
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Material</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Denim">Denim</option>
                  <option value="Bobbin">Bobbin</option>
                  <option value="Buttons">Buttons</option>
                  <option value="Zippers">Zippers</option>
                  <option value="Elastic">Elastic</option>
                  <option value="Needles">Needles</option>
                </select>

                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Unit</option>
                  <option value="m">Meter (m)</option>
                  <option value="pcs">Pieces</option>
                  <option value="box">Box</option>
                </select>

                <input
                  type="number"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />

                <div className="flex items-center border border-gray-300 rounded-lg">
                  <span className="px-3 text-gray-500 font-semibold text-sm">LKR</span>
                  <input
                    type="number"
                    placeholder="Unit Price"
                    value={formData.unitPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, unitPrice: e.target.value })
                    }
                    className="flex-1 p-3 rounded-r-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    min="1"
                    required
                  />
                </div>

                <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50">
                  <span className="px-3 text-gray-500 font-semibold text-sm">Total</span>
                  <input
                    type="number"
                    placeholder="Total Price"
                    value={formData.price}
                    readOnly
                    className="flex-1 p-3 rounded-r-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                  />
                </div>

                <select
                  value={formData.suppliers}
                  onChange={(e) => setFormData({ ...formData, suppliers: e.target.value })}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Supplier</option>
                  <option value="Global Fabrics Ltd">Global Fabrics Ltd</option>
                  <option value="UniTex Suppliers">UniTex Suppliers</option>
                  <option value="Elegant Labels Co.">Elegant Labels Co.</option>
                </select>

                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>

                <div className="flex justify-end gap-4 mt-2">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition"
                  >
                    {editingRaw ? "Update" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
