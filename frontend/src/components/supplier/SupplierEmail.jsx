// frontend/src/components/supplier/SupplierEmail.jsx
import React, { useEffect, useState } from "react";
import { Search, Download, Trash2, Mail, X } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const SupplierEmail = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    supplierName: "",
    email: "",
    item: "",
    unit: "",
    quantity: "",
  });

  // ✅ Base URL
  const API_BASE = "http://localhost:8070/supplier";

  // ✅ Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE}/all`);
        const data = await res.json();
        setOrders(data.data || []);
      } catch (error) {
        console.error("Error fetching supplier orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // ✅ Filter helpers
  const uniqueYears = [
    ...new Set(
      orders
        .filter((o) => o.createdAt)
        .map((o) => new Date(o.createdAt).getFullYear())
    ),
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.supplierName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.item || "").toLowerCase().includes(searchTerm.toLowerCase());

    const createdAt = o.createdAt ? new Date(o.createdAt) : null;
    const matchesYear =
      yearFilter === "all" ||
      (createdAt && createdAt.getFullYear().toString() === yearFilter);
    const matchesMonth =
      monthFilter === "all" ||
      (createdAt && (createdAt.getMonth() + 1).toString() === monthFilter);

    return matchesSearch && matchesYear && matchesMonth;
  });

  // ✅ Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  // ✅ Send email + save order
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => [data.order, ...prev]);
        alert("✅ Order email sent & saved");
        setModalOpen(false);
        setFormData({
          supplierName: "",
          email: "",
          item: "",
          unit: "",
          quantity: "",
        });
      } else {
        alert("❌ Failed to send order email");
      }
    } catch (error) {
      console.error("Error sending order email:", error);
      alert("❌ Failed to send order email");
    }
  };

  // ✅ Export PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Supplier Orders Report", 14, 16);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 24);

    doc.autoTable({
      startY: 30,
      head: [["Supplier", "Email", "Item", "Unit", "Quantity", "Date", "Status"]],
      body: filteredOrders.map((o) => [
        o.supplierName,
        o.email,
        o.item,
        o.unit || "N/A",
        o.quantity,
        o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "N/A",
        o.status || "N/A",
      ]),
      theme: "grid",
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 10, cellPadding: 4 },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() - 20,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    doc.save("SupplierOrders_Report.pdf");
  };

  // ✅ Loader
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  // ✅ UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Mail className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Supplier Orders</h1>
              <p className="text-gray-600">Manage and track supplier orders</p>
            </div>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            + New Order
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by supplier, item, email..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="pl-3 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="all">All Years</option>
              {uniqueYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              className="pl-3 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            >
              <option value="all">All Months</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            <Download className="h-5 w-5" />
            <span>Download PDF</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] max-w-6xl mx-auto table-auto border-collapse text-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">Supplier</th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">Unit</th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((o, index) => (
                  <tr
                    key={o._id}
                    className={`hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <td className="px-4 py-3">{o.supplierName}</td>
                    <td className="px-4 py-3">{o.email}</td>
                    <td className="px-4 py-3">{o.item}</td>
                    <td className="px-4 py-3">{o.unit || "N/A"}</td>
                    <td className="px-4 py-3">{o.quantity}</td>
                    <td className="px-4 py-3">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-3">{o.status || "N/A"}</td>
                    <td className="px-4 py-3 text-center">
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
              <div className="text-center py-12 text-gray-500">No supplier orders found</div>
            )}
          </div>
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Send Supplier Order</h2>
              <form className="grid gap-4" onSubmit={handleFormSubmit}>
                {/* Supplier Dropdown */}
                <select
                  value={formData.supplierName}
                  onChange={(e) => {
                    const selected = e.target.value;
                    let email = "";
                    if (selected === "Global Fabrics Ltd") email = "globalFabrics@gmail.com";
                    if (selected === "UniTex Suppliers") email = "unitexSuppliers@gmail.com";
                    if (selected === "Elegant Labels Co.") email = "elegant.labels.co@gmail.com";
                    if (selected === "Example") email = "dilshara329@gmail.com";

                    setFormData({ ...formData, supplierName: selected, email });
                  }}
                  className="border rounded-lg p-3"
                  required
                >
                  <option value="">Select Supplier</option>
                  <option value="Global Fabrics Ltd">Global Fabrics Ltd</option>
                  <option value="UniTex Suppliers">UniTex Suppliers</option>
                  <option value="Elegant Labels Co.">Elegant Labels Co.</option>
                  <option value="Example">Example</option>
                </select>

                {/* Email auto-filled */}
                <input
                  type="email"
                  placeholder="Supplier Email"
                  value={formData.email}
                  readOnly
                  className="border rounded-lg p-3 bg-gray-100 cursor-not-allowed"
                  required
                />

                {/* Item Dropdown */}
                <select
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value, unit: "" })}
                  className="border rounded-lg p-3"
                  required
                >
                  <option value="">Select Material</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Denim">Denim</option>
                  <option value="Buttons">Buttons</option>
                  <option value="Zippers">Zippers</option>
                  <option value="Elastic">Elastic</option>
                  <option value="Needles">Needles</option>
                </select>

                {/* Unit Dropdown */}
                {formData.item && (
                  <select
                    value={formData.unit || ""}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="border rounded-lg p-3"
                    required
                  >
                    <option value="">Select Unit</option>
                    {formData.item === "Cotton" && (
                      <>
                        <option value="meters">Meters (m)</option>
                        <option value="centimeters">Centimeters (cm)</option>
                      </>
                    )}
                    {formData.item === "Denim" && (
                      <>
                        <option value="centimeters">Centimeters (cm)</option>
                        <option value="meters">Meters (m)</option>
                      </>
                    )}
                    {formData.item === "Buttons" && <option value="box">Box</option>}
                    {formData.item === "Zippers" && <option value="box">Box</option>}
                    {formData.item === "Elastic" && <option value="box">Box</option>}
                    {formData.item === "Needles" && (
                      <>
                        <option value="box">Box</option>
                        <option value="packets_10">Packets (10 pcs)</option>
                        <option value="packets_50">Packets (50 pcs)</option>
                      </>
                    )}
                  </select>
                )}

                {/* Quantity with live validation */}
                <input
                  type="number"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || Number(val) > 0) {
                      setFormData({ ...formData, quantity: val });
                    }
                  }}
                  min="1"
                  className="border rounded-lg p-3"
                  required
                />

                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
                  >
                    Send
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded-lg"
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
};

export default SupplierEmail;
