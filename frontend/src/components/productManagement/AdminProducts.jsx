// AdminProducts.js
import React, { useEffect, useState } from "react";
import { Search, Trash2, Edit, Plus, X, Package, Download } from "lucide-react";
import { generateProductsPDF } from "./productPDF"; // <-- Import PDF generator

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Mensware",
    price: "",
    description: "",
    stockQuantity: "",
    size: "M",
    images: [],
  });

  // ✅ Fetch products
  useEffect(() => {
    fetch("http://localhost:8070/product/allProducts")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Filters
  const filtered = products.filter((p) => {
    const matchesSearch = (p.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || p.category === categoryFilter;

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "empty" && p.stockQuantity <= 0) ||
      (stockFilter === "low" && p.stockQuantity > 0 && p.stockQuantity <= 5);

    return matchesSearch && matchesCategory && matchesStock;
  });

  // ✅ Open modal
  const openModal = (p = null) => {
    setEditingProduct(p);
    setFormData(
      p
        ? {
            name: p.name,
            category: p.category,
            price: p.price,
            description: p.description,
            stockQuantity: p.stockQuantity,
            size: p.size || "M",
            images: [],
          }
        : {
            name: "",
            category: "Mensware",
            price: "",
            description: "",
            stockQuantity: "",
            size: "M",
            images: [],
          }
    );
    setModalOpen(true);
  };

  // ✅ Handle form changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, images: [...formData.images, ...files] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "images") {
          formData.images.forEach((f) => form.append("images", f));
        } else {
          form.append(key, formData[key]);
        }
      });

      const url = editingProduct
        ? `http://localhost:8070/product/updateProduct/${editingProduct._id}`
        : "http://localhost:8070/product/addProduct";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, { method, body: form });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Failed to save");

      const savedProduct = result.product || result;

      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) => (p._id === savedProduct._id ? savedProduct : p))
        );
      } else {
        setProducts((prev) => [...prev, savedProduct]);
      }

      setModalOpen(false);
      setEditingProduct(null);
      setFormData({
        name: "",
        category: "Mensware",
        price: "",
        description: "",
        stockQuantity: "",
        size: "M",
        images: [],
      });
    } catch (err) {
      console.error(err);
      alert("Error saving product: " + err.message);
    }
  };

  // ✅ Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Delete product?")) return;
    try {
      const res = await fetch(
        `http://localhost:8070/product/deleteProduct/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete product");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting product: " + err.message);
    }
  };

  // ✅ Download PDF
  const handleDownloadPDF = async () => {
    const doc = await generateProductsPDF(filtered);
    doc.save("Products_Report.pdf");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading products...</p>
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
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Product Management
              </h1>
              <p className="text-gray-600">Manage and view all store products</p>
            </div>
          </div>
          <div className="flex gap-3">
            {/* Add Product Button */}
            <button
              onClick={() => openModal()}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus className="h-5 w-5" /> Add Product
            </button>
            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Download className="h-5 w-5" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by product name..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="pl-3 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Mensware">Mensware</option>
              <option value="FemaleWare">FemaleWare</option>
              <option value="Kidsware">Kidsware</option>
            </select>

            {/* Stock Filter */}
            <select
              className="pl-3 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="all">All Stock</option>
              <option value="empty">Empty Stock</option>
              <option value="low">Low Stock (≤5)</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse text-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                    Images
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-center font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((p, index) => (
                  <tr
                    key={p._id}
                    className={`hover:bg-gray-50 transition-colors duration-150 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {p.images?.length > 0 ? (
                          p.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={`http://localhost:8070${img}`}
                              alt="product"
                              className="h-12 w-12 object-cover rounded border"
                            />
                          ))
                        ) : (
                          <span className="text-gray-400">No Images</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {p.name}
                    </td>
                    <td className="px-4 py-3">{p.category}</td>
                    <td className="px-4 py-3">{p.size}</td>
                    <td className="px-4 py-3">Rs. {p.price}</td>
                    <td className="px-4 py-3">{p.stockQuantity}</td>
                    <td className="px-4 py-3 text-center flex justify-center gap-2">
                      <button
                        onClick={() => openModal(p)}
                        className="inline-flex items-center px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-xs transition"
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="inline-flex items-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs transition"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No products found
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Product Name"
                  className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />

                {/* Category */}
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                >
                  <option value="Mensware">Mensware</option>
                  <option value="FemaleWare">FemaleWare</option>
                  <option value="Kidsware">Kidsware</option>
                </select>

                {/* Size */}
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                >
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Price"
                  className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description"
                  className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  placeholder="Stock Quantity"
                  className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />

                <input
                  type="file"
                  name="images"
                  multiple
                  accept="image/*"
                  onChange={handleChange}
                />

                {/* Preview new images */}
                <div className="flex gap-2 flex-wrap mt-2">
                  {formData.images.length > 0 &&
                    Array.from(formData.images).map((img, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={URL.createObjectURL(img)}
                          alt="preview"
                          className="h-16 w-16 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              images: formData.images.filter((_, i) => i !== idx),
                            })
                          }
                          className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                </div>

                <div className="flex justify-end gap-4 mt-2">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition"
                  >
                    {editingProduct ? "Update" : "Save"}
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
