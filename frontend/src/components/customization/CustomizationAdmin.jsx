import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Save, Edit, X, Search, Package, Settings } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8070";

export default function AdminCustomizationPage() {
  const [products, setProducts] = useState([]);
  const [customizations, setCustomizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    productId: "",
    options: [],
  });
  const [errors, setErrors] = useState({}); // ✅ For inline validation
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, customizationsRes] = await Promise.all([
        axios.get(`${API}/product/allProducts`),
        axios.get(`${API}/customization/all`),
      ]);
      setProducts(productsRes.data);
      setCustomizations(customizationsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error loading data ❌");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomizations = async () => {
    const res = await axios.get(`${API}/customization/all`);
    setCustomizations(res.data);
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [
        ...formData.options,
        { name: "", type: "select", values: [{ label: "", price: 0 }] },
      ],
    });
  };

  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const removeValue = (optionIndex, valueIndex) => {
    const newOptions = [...formData.options];
    newOptions[optionIndex].values = newOptions[optionIndex].values.filter(
      (_, i) => i !== valueIndex
    );
    setFormData({ ...formData, options: newOptions });
  };

  const addValueToOption = (index) => {
    const newOptions = [...formData.options];
    newOptions[index].values.push({ label: "", price: 0 });
    setFormData({ ...formData, options: newOptions });
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = value;

    // ✅ Live validation
    if (field === "name" && /[0-9]/.test(value)) {
      setErrors({
        ...errors,
        [`option-${index}`]: "Option name cannot contain numbers",
      });
    } else {
      const newErrors = { ...errors };
      delete newErrors[`option-${index}`];
      setErrors(newErrors);
    }

    setFormData({ ...formData, options: newOptions });
  };

  const handleValueChange = (optionIndex, valueIndex, field, value) => {
    const newOptions = [...formData.options];
    newOptions[optionIndex].values[valueIndex][field] =
      field === "price" ? value : value;

    const errorKey = `value-${optionIndex}-${valueIndex}-${field}`;

    // ✅ Live validation for label (no numbers)
    if (field === "label" && /[0-9]/.test(value)) {
      setErrors({
        ...errors,
        [errorKey]: "Value label cannot contain numbers",
      });
    }
    // ✅ Live validation for price (no letters)
    else if (field === "price" && /[a-zA-Z]/.test(value)) {
      setErrors({
        ...errors,
        [errorKey]: "Price must contain numbers only",
      });
    } else {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }

    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submit if errors exist
    if (Object.keys(errors).length > 0) {
      alert("Please fix validation errors before saving ❌");
      return;
    }

    setIsSubmitting(true);

    const sanitized = {
      ...formData,
      options: formData.options
        .filter((o) => o.name.trim() !== "")
        .map((o) => ({
          ...o,
          values: o.values.filter((v) => v.label.trim() !== ""),
        })),
    };

    try {
      if (editingId) {
        await axios.put(`${API}/customization/update/${editingId}`, sanitized);
        alert("Customization updated successfully ✅");
      } else {
        await axios.post(`${API}/customization/add`, sanitized);
        alert("Customization added successfully ✅");
      }
      resetForm();
      fetchCustomizations();
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving customization ❌");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ productId: "", options: [] });
    setEditingId(null);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customization?")) return;
    try {
      await axios.delete(`${API}/customization/delete/${id}`);
      fetchCustomizations();
    } catch (error) {
      alert("Error deleting customization ❌");
    }
  };

  const handleEdit = (customization) => {
    setFormData({
      productId: customization.productId?._id || "",
      options: customization.options,
    });
    setEditingId(customization._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredCustomizations = customizations.filter((c) =>
    c.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Customization Management</h1>
          </div>
          <p className="text-gray-600">Manage product customizations and options</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  {editingId ? "Edit Customization" : "Add New Customization"}
                </h2>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Product Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Product *
                  </label>
                  <select
                    value={formData.productId}
                    onChange={(e) =>
                      setFormData({ ...formData, productId: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Choose a product...</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Options Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Customization Options
                    </label>
                    <button
                      type="button"
                      onClick={addOption}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={16} />
                      Add Option
                    </button>
                  </div>

                  {formData.options.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No options added yet</p>
                      <p className="text-sm text-gray-400">
                        Click "Add Option" to get started
                      </p>
                    </div>
                  )}

                  {formData.options.map((opt, optIndex) => (
                    <div
                      key={optIndex}
                      className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Option name (e.g., Fabric Type, Color)"
                            className={`w-full border rounded-lg p-3 mr-3 focus:ring-2 ${
                              errors[`option-${optIndex}`]
                                ? "border-red-500 focus:ring-red-400"
                                : "border-gray-300 focus:ring-blue-500"
                            }`}
                            value={opt.name}
                            onChange={(e) =>
                              handleOptionChange(optIndex, "name", e.target.value)
                            }
                          />
                          {errors[`option-${optIndex}`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`option-${optIndex}`]}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeOption(optIndex)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Values */}
                      <div className="space-y-2">
                        {opt.values.map((val, valIndex) => (
                          <div key={valIndex} className="flex gap-2 items-start">
                            <div className="flex-1">
                              <input
                                type="text"
                                placeholder="Value label (e.g., Cotton, Silk)"
                                className={`w-full border rounded-lg p-2 focus:ring-2 ${
                                  errors[`value-${optIndex}-${valIndex}-label`]
                                    ? "border-red-500 focus:ring-red-400"
                                    : "border-gray-300 focus:ring-blue-500"
                                }`}
                                value={val.label}
                                onChange={(e) =>
                                  handleValueChange(
                                    optIndex,
                                    valIndex,
                                    "label",
                                    e.target.value
                                  )
                                }
                              />
                              {errors[`value-${optIndex}-${valIndex}-label`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors[`value-${optIndex}-${valIndex}-label`]}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                  $
                                </span>
                                <input
                                  type="text"
                                  placeholder="0.00"
                                  className={`w-24 border rounded-lg p-2 pl-7 focus:ring-2 ${
                                    errors[`value-${optIndex}-${valIndex}-price`]
                                      ? "border-red-500 focus:ring-red-400"
                                      : "border-gray-300 focus:ring-blue-500"
                                  }`}
                                  value={val.price}
                                  onChange={(e) =>
                                    handleValueChange(
                                      optIndex,
                                      valIndex,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                />
                                {errors[`value-${optIndex}-${valIndex}-price`] && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors[`value-${optIndex}-${valIndex}-price`]}
                                  </p>
                                )}
                              </div>
                              {opt.values.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeValue(optIndex, valIndex)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <X size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => addValueToOption(optIndex)}
                        className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <Plus size={14} />
                        Add Value
                      </button>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save size={16} />
                    {isSubmitting
                      ? "Saving..."
                      : editingId
                      ? "Update Customization"
                      : "Save Customization"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Existing Customizations
                </h2>
              </div>

              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Customizations List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading...</p>
                  </div>
                ) : filteredCustomizations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p>No customizations found</p>
                  </div>
                ) : (
                  filteredCustomizations.map((c) => (
                    <div
                      key={c._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {c.productId?.name}
                        </h3>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(c)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(c._id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {c.options.map((o, i) => (
                          <div key={i} className="text-sm text-gray-600">
                            <span className="font-medium">{o.name}:</span>{" "}
                            {o.values.map((v, vIndex) => (
                              <span key={vIndex}>
                                {v.label} (+${v.price})
                                {vIndex < o.values.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
