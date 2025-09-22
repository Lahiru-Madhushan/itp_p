import React, { useState } from "react";
import axios from "axios";
import {
  Shirt,
  Scissors,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Footer from "../Footer";

const CustomizationForm = () => {
  const [clothingType, setClothingType] = useState("Shirt");
  const [formData, setFormData] = useState({
    fabric: "",
    fabricColor: "",
    size: "",
    measurements: {},
    designImage: null,
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, designImage: files[0] });
    } else if (name.startsWith("measurements")) {
      setFormData({
        ...formData,
        measurements: { ...formData.measurements, [name.split(".")[1]]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const data = new FormData();
      data.append("clothingType", clothingType);
      data.append("fabric", formData.fabric);
      data.append("fabricColor", formData.fabricColor);
      data.append("size", formData.size);

      Object.entries(formData.measurements).forEach(([key, value]) => {
        data.append(`measurements[${key}]`, value);
      });

      if (formData.designImage) {
        data.append("designImage", formData.designImage);
      }

      await axios.post("http://localhost:8070/customization/add", data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Customization submitted successfully!");
      setFormData({
        fabric: "",
        fabricColor: "",
        size: "",
        measurements: {},
        designImage: null,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit customization");
    }
  };

  const measurementFields = {
    Shirt: ["chest", "shoulder", "sleeveLength", "collar"],
    Trouser: ["waist", "hip", "thigh", "inseam", "outseam"],
    Frock: ["bust", "waist", "hip", "frockLength", "sleeveLength"],
  };

  return (
    <div>
    <div className="min-h-screen bg-gradient-to-br from-white via-yellow-50 to-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200 rounded-full opacity-10 blur-3xl transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-300 rounded-full opacity-8 blur-3xl transform -translate-x-24 translate-y-24"></div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-yellow-100 p-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-3xl mb-6 shadow-xl">
            <Shirt className="text-black w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold mb-2">
            <span className="bg-gradient-to-r from-black via-yellow-600 to-black bg-clip-text text-transparent">
              Customize Your Clothing
            </span>
          </h1>
          <p className="text-gray-600 text-lg">
            Craft your perfect fit with our tailoring service
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-6 flex items-center bg-green-100 text-green-700 p-4 rounded-xl shadow">
            <CheckCircle className="mr-2" /> {success}
          </div>
        )}
        {error && (
          <div className="mb-6 flex items-center bg-red-100 text-red-700 p-4 rounded-xl shadow">
            <AlertCircle className="mr-2" /> {error}
          </div>
        )}

        {/* Clothing Type */}
        <div className="mb-6">
          <label className="block font-bold mb-2">Clothing Type</label>
          <select
            value={clothingType}
            onChange={(e) => setClothingType(e.target.value)}
            className="w-full border-2 border-yellow-200 rounded-xl p-4 font-semibold focus:ring-2 focus:ring-yellow-300"
          >
            <option value="Shirt">👔 Shirt</option>
            <option value="Trouser">👖 Trouser</option>
            <option value="Frock">👗 Frock</option>
          </select>
        </div>

        {/* Basic info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <input
            type="text"
            name="fabric"
            placeholder="Fabric"
            value={formData.fabric}
            onChange={handleChange}
            className="border p-4 rounded-xl"
          />
          <input
            type="text"
            name="fabricColor"
            placeholder="Fabric Color"
            value={formData.fabricColor}
            onChange={handleChange}
            className="border p-4 rounded-xl"
          />
          <input
            type="text"
            name="size"
            placeholder="Size (e.g., M, L, XL or 32)"
            value={formData.size}
            onChange={handleChange}
            className="border p-4 rounded-xl md:col-span-2"
          />
        </div>

        {/* Measurements */}
        <div className="mb-6">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Scissors className="text-yellow-500" /> Measurements (in inches)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {measurementFields[clothingType].map((field) => (
              <input
                key={field}
                type="text"
                name={`measurements.${field}`}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={formData.measurements[field] || ""}
                onChange={handleChange}
                className="border p-4 rounded-xl"
              />
            ))}
          </div>
        </div>

        {/* Upload */}
        <div className="mb-6">
          <label className="flex items-center gap-2 font-semibold mb-2">
            <Upload className="text-yellow-500" /> Upload Design (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="w-full border-2 border-dashed border-yellow-300 p-6 rounded-xl"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-black font-bold py-4 rounded-2xl hover:scale-105 transition-all shadow-xl"
        >
          Submit Customization
        </button>
      </form>
      
    </div>
    <Footer />
    </div>
  );
};

export default CustomizationForm;
