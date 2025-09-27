import React, { useState, useEffect } from "react";
import {
  Trash2,
  Edit3,
  Star,
  Heart,
  ShoppingBag,
  Users,
  MessageCircle,
  Camera,
} from "lucide-react";

const API_URL = "http://localhost:8070/feedback";

import Footer from "../Footer";

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [formData, setFormData] = useState({
    reviewerName: "",
    email: "",
    reviewTitle: "",
    detailedFeedback: "",
    category: "Product",
    wouldRecommend: false,
    images: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("form");

  // ✅ Fetch feedbacks
  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(`${API_URL}/all`);
      const data = await res.json();
      setFeedbacks(data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // ✅ Handle input
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
    if (formData.detailedFeedback.length < 10) {
      alert("Feedback must be at least 10 characters long.");
      return;
    }

    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "images") {
        formData.images.forEach((f) => form.append("images", f));
      } else {
        form.append(key, formData[key]);
      }
    });

    const url = editingId ? `${API_URL}/update/${editingId}` : `${API_URL}/add`;
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, { method, body: form });
    const result = await res.json();

    if (res.ok) {
      setEditingId(null);
      setFormData({
        reviewerName: "",
        email: "",
        reviewTitle: "",
        detailedFeedback: "",
        category: "Product",
        wouldRecommend: false,
        images: [],
      });
      fetchFeedbacks();
      setActiveTab("reviews");
    } else {
      alert(result.message || "Error saving feedback");
    }
  };

  // ✅ Edit
  const handleEdit = (fb) => {
    setEditingId(fb._id);
    setFormData({
      reviewerName: fb.reviewerName,
      email: fb.email,
      reviewTitle: fb.reviewTitle,
      detailedFeedback: fb.detailedFeedback,
      category: fb.category,
      wouldRecommend: fb.wouldRecommend,
      images: [],
    });
    setActiveTab("form");
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;
    await fetch(`${API_URL}/delete/${id}`, { method: "DELETE" });
    fetchFeedbacks();
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Product":
        return <ShoppingBag className="w-4 h-4" />;
      case "Service":
        return <Users className="w-4 h-4" />;
      case "Delivery":
        return <Star className="w-4 h-4" />;
      case "Website":
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl font-bold text-black mb-2">
            Customer Feedback
          </h1>
          <p className="text-black/80 text-lg">
            Help us serve you better with your valuable feedback
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-yellow-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("form")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === "form"
                  ? "bg-yellow-400 text-black shadow-md"
                  : "text-black/70 hover:bg-yellow-200"
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Leave Feedback
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ml-2 ${
                activeTab === "reviews"
                  ? "bg-yellow-400 text-black shadow-md"
                  : "text-black/70 hover:bg-yellow-200"
              }`}
            >
              <Star className="w-4 h-4 inline mr-2" />
              View Reviews ({feedbacks.length})
            </button>
          </div>
        </div>

        {/* Form Tab */}
        {activeTab === "form" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-yellow-100 p-8">
              <h2 className="text-2xl font-bold text-black mb-6 text-center">
                {editingId ? "Edit Your Feedback" : "Share Your Experience"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <input
                  type="text"
                  name="reviewerName"
                  value={formData.reviewerName}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-xl border-2 border-yellow-200 focus:border-yellow-400"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  className="w-full px-4 py-3 rounded-xl border-2 border-yellow-200 focus:border-yellow-400"
                  required
                />
                <input
                  type="text"
                  name="reviewTitle"
                  value={formData.reviewTitle}
                  onChange={handleChange}
                  placeholder="Review Title"
                  className="w-full px-4 py-3 rounded-xl border-2 border-yellow-200 focus:border-yellow-400"
                  required
                />
                <textarea
                  name="detailedFeedback"
                  value={formData.detailedFeedback}
                  onChange={handleChange}
                  placeholder="Your Feedback"
                  className="w-full px-4 py-3 rounded-xl border-2 border-yellow-200 focus:border-yellow-400 h-28 resize-none"
                  required
                />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-yellow-200 focus:border-yellow-400"
                >
                  <option>Product</option>
                  <option>Service</option>
                  <option>Delivery</option>
                  <option>Website</option>
                  <option>Other</option>
                </select>

                <label className="flex items-center gap-2 bg-yellow-50 rounded-xl p-3">
                  <input
                    type="checkbox"
                    name="wouldRecommend"
                    checked={formData.wouldRecommend}
                    onChange={handleChange}
                  />
                  <span className="text-black font-medium">
                    <Heart className="w-4 h-4 inline mr-1" />
                    I would recommend this store
                  </span>
                </label>

                <div>
                  <label className="block text-black font-medium mb-2">
                    <Camera className="w-4 h-4 inline mr-2" />
                    Add Photos
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-yellow-200 focus:border-yellow-400"
                  />
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from(formData.images).map((img, i) => (
                      <img
                        key={i}
                        src={URL.createObjectURL(img)}
                        alt="preview"
                        className="w-20 h-20 object-cover rounded-xl border-2 border-yellow-200"
                      />
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold py-4 rounded-xl hover:from-yellow-500 hover:to-yellow-600 shadow-lg"
                >
                  {editingId ? "Update Feedback" : "Submit Feedback"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="grid gap-6">
            {feedbacks.map((f) => (
              <div
                key={f._id}
                className="bg-white rounded-2xl shadow-lg border border-yellow-100 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 p-2 rounded-full">
                      {getCategoryIcon(f.category)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black">
                        {f.reviewTitle}
                      </h3>
                      <p className="text-black/60">by {f.reviewerName}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(f)}
                      className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(f._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-black/80 mb-4">{f.detailedFeedback}</p>

                <div className="flex items-center justify-between text-sm">
                  <span className="bg-yellow-100 text-black px-3 py-1 rounded-full font-medium">
                    {f.category}
                  </span>
                  {f.wouldRecommend && (
                    <span className="text-green-600 flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      Recommends
                    </span>
                  )}
                  <span className="text-black/50">{f.email}</span>
                </div>

                {f.images && f.images.length > 0 && (
                  <div className="flex gap-2 mt-4">
                    {f.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={`http://localhost:8070${img}`}
                        alt="feedback"
                        className="w-20 h-20 object-cover rounded-xl border-2 border-yellow-200"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
