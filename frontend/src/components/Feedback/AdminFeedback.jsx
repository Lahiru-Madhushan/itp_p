import React, { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  Edit,
  Plus,
  X,
  MessageSquare,
} from "lucide-react";
import api from "../../lib/axios";

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [recommendFilter, setRecommendFilter] = useState("all");
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    reviewerName: "",
    email: "",
    reviewTitle: "",
    detailedFeedback: "",
    category: "Other",
    wouldRecommend: false,
    images: [],
  });

  // ✅ Fetch feedbacks
  useEffect(() => {
    // Uses the shared axios instance so the admin's auth cookie is sent -
    // reviewer emails are only returned to admins.
    api
      .get("/feedback/all")
      .then((res) => setFeedbacks(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Filters
  const filtered = feedbacks.filter((f) => {
    const matchesSearch =
      (f.reviewTitle || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.reviewerName || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || f.category === categoryFilter;

    const matchesRecommend =
      recommendFilter === "all" ||
      (recommendFilter === "yes" && f.wouldRecommend) ||
      (recommendFilter === "no" && !f.wouldRecommend);

    return matchesSearch && matchesCategory && matchesRecommend;
  });

  // ✅ Open modal
  const openModal = (f = null) => {
    setEditingFeedback(f);
    setFormData(
      f
        ? {
            reviewerName: f.reviewerName,
            email: f.email,
            reviewTitle: f.reviewTitle,
            detailedFeedback: f.detailedFeedback,
            category: f.category,
            wouldRecommend: f.wouldRecommend,
            images: [],
          }
        : {
            reviewerName: "",
            email: "",
            reviewTitle: "",
            detailedFeedback: "",
            category: "Other",
            wouldRecommend: false,
            images: [],
          }
    );
    setModalOpen(true);
  };

  // ✅ Handle form input
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (files) {
      setFormData({ ...formData, images: [...files] });
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ✅ Submit
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

      const res = editingFeedback
        ? await api.put(`/feedback/update/${editingFeedback._id}`, form)
        : await api.post("/feedback/add", form);

      const result = res.data;
      const savedFeedback = result.feedback || result;

      if (editingFeedback) {
        setFeedbacks((prev) =>
          prev.map((f) => (f._id === savedFeedback._id ? savedFeedback : f))
        );
      } else {
        setFeedbacks((prev) => [...prev, savedFeedback]);
      }

      setModalOpen(false);
      setEditingFeedback(null);
      setFormData({
        reviewerName: "",
        email: "",
        reviewTitle: "",
        detailedFeedback: "",
        category: "Other",
        wouldRecommend: false,
        images: [],
      });
    } catch (err) {
      console.error(err);
      alert("Error saving feedback: " + (err?.response?.data?.message || err.message));
    }
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;
    try {
      await api.delete(`/feedback/delete/${id}`);
      setFeedbacks((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting: " + (err?.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading feedbacks...</p>
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
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Feedback Management
              </h1>
              <p className="text-gray-600">
                View, filter, edit and delete customer feedback
              </p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Add Feedback
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by title or name..."
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
              <option value="Product">Product</option>
              <option value="Service">Service</option>
              <option value="Delivery">Delivery</option>
              <option value="Website">Website</option>
              <option value="Other">Other</option>
            </select>

            {/* Recommend Filter */}
            <select
              className="pl-3 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              value={recommendFilter}
              onChange={(e) => setRecommendFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="yes">Recommends</option>
              <option value="no">Does Not Recommend</option>
            </select>
          </div>
        </div>

        {/* Feedbacks Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse text-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                    Images
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Recommend</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((f, index) => (
                  <tr
                    key={f._id}
                    className={`hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {f.images?.length > 0 ? (
                          f.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={`http://localhost:8070${img}`}
                              alt="feedback"
                              className="h-12 w-12 object-cover rounded border"
                            />
                          ))
                        ) : (
                          <span className="text-gray-400">No Images</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {f.reviewTitle}
                    </td>
                    <td className="px-4 py-3">{f.category}</td>
                    <td className="px-4 py-3">{f.reviewerName}</td>
                    <td className="px-4 py-3">
                      {f.wouldRecommend ? "✅ Yes" : "❌ No"}
                    </td>
                    <td className="px-4 py-3 text-center flex justify-center gap-2">
                      <button
                        onClick={() => openModal(f)}
                        className="inline-flex items-center px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-xs transition"
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(f._id)}
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
                No feedback found
              </div>
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
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingFeedback ? "Edit Feedback" : "Add Feedback"}
              </h2>
              <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
                <input
                  name="reviewerName"
                  value={formData.reviewerName}
                  onChange={handleChange}
                  placeholder="Name"
                  className="border border-gray-300 rounded-lg p-3"
                  required
                />
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="border border-gray-300 rounded-lg p-3"
                  required
                />
                <input
                  name="reviewTitle"
                  value={formData.reviewTitle}
                  onChange={handleChange}
                  placeholder="Title"
                  className="border border-gray-300 rounded-lg p-3"
                  required
                />
                <textarea
                  name="detailedFeedback"
                  value={formData.detailedFeedback}
                  onChange={handleChange}
                  placeholder="Detailed Feedback"
                  className="border border-gray-300 rounded-lg p-3"
                  required
                />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-3"
                >
                  <option>Product</option>
                  <option>Service</option>
                  <option>Delivery</option>
                  <option>Website</option>
                  <option>Other</option>
                </select>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="wouldRecommend"
                    checked={formData.wouldRecommend}
                    onChange={handleChange}
                  />
                  Would Recommend
                </label>
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
                    {editingFeedback ? "Update" : "Save"}
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
