import React, { useState } from "react";
import axios from "axios";
import {
  Shirt,
  Scissors,
  Upload,
  CheckCircle,
  AlertCircle,
  Palette,
  Ruler,
  Sparkles,
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
  const [errors, setErrors] = useState({}); // field-level errors

  // --- Validation function for individual fields ---
  const validateField = (name, value) => {
    let message = "";

    if (name === "fabric" && (!value || !/^[A-Za-z\s]+$/.test(value))) {
      message = "Fabric should only contain letters (e.g., Cotton, Silk)";
    }

    if (name === "fabricColor" && (!value || !/^[A-Za-z\s]+$/.test(value))) {
      message = "Fabric color should only contain letters (e.g., Red, Blue)";
    }

    if (name === "size" && (!value || !/^(S|M|L|XL|XS|\d{1,3})$/i.test(value))) {
      message = "Size must be S, M, L, XL, XS, or a number (e.g., 32)";
    }

    if (name.startsWith("measurements") && value && !/^\d{1,3}(\.\d{1,2})?$/.test(value)) {
      const field = name.split(".")[1];
      message = `${field} must be a valid number (e.g., 34 or 34.5)`;
    }

    return message;
  };

  // --- Handle Change with Live Validation ---
const handleChange = (e) => {
  const { name, value, files } = e.target;

  if (files) {
    const file = files[0];
    setFormData((prev) => ({
      ...prev,
      designImage: file,
      previewUrl: URL.createObjectURL(file), // ✅ store preview for UI
    }));
  } else if (name.startsWith("measurements")) {
    setFormData({
      ...formData,
      measurements: { ...formData.measurements, [name.split(".")[1]]: value },
    });

    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  } else {
    setFormData({ ...formData, [name]: value });

    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  }
};


  // --- Final Validation before submit ---
  const validateForm = () => {
    const newErrors = {};

    newErrors.fabric = validateField("fabric", formData.fabric);
    newErrors.fabricColor = validateField("fabricColor", formData.fabricColor);
    newErrors.size = validateField("size", formData.size);

    Object.entries(formData.measurements).forEach(([key, value]) => {
      newErrors[`measurements.${key}`] = validateField(`measurements.${key}`, value);
    });

    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, v]) => v) // only keep non-empty errors
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setErrors({});

    if (!validateForm()) return; // stop if errors exist

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
      setErrors({ general: err.response?.data?.message || "Failed to submit customization" });
    }
  };

  const measurementFields = {
    Shirt: ["chest", "shoulder", "sleeveLength", "collar"],
    Trouser: ["waist", "hip", "thigh", "inseam", "outseam"],
    Frock: ["bust", "waist", "hip", "frockLength", "sleeveLength"],
  };

  const clothingOptions = [
    { 
      name: "Shirt", 
      icon: "👔",
      gradient: "from-blue-500 to-cyan-500",
      hoverGradient: "from-blue-600 to-cyan-600",
      shadowColor: "shadow-blue-500/25"
    },
    { 
      name: "Trouser", 
      icon: "👖",
      gradient: "from-purple-500 to-pink-500", 
      hoverGradient: "from-purple-600 to-pink-600",
      shadowColor: "shadow-purple-500/25"
    },
    { 
      name: "Frock", 
      icon: "👗",
      gradient: "from-pink-500 to-rose-500",
      hoverGradient: "from-pink-600 to-rose-600", 
      shadowColor: "shadow-pink-500/25"
    },
  ];

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Enhanced Animated Background Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-25 animate-bounce delay-300"></div>
        <div className="absolute bottom-1/3 right-1/4 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-20 animate-ping"></div>
        <div className="absolute top-20 right-1/3 w-6 h-6 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-30 animate-bounce delay-500"></div>
        <div className="absolute bottom-40 left-1/3 w-10 h-10 bg-gradient-to-r from-teal-400 to-green-400 rounded-full opacity-25 animate-pulse delay-700"></div>

        <form
          onSubmit={handleSubmit}
          className="relative w-full max-w-4xl bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-10 transform transition-all duration-500 hover:shadow-3xl animate-fade-in"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Header with Animation */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white rounded-full shadow-xl transform transition-all duration-300 hover:scale-105 animate-pulse">
              <Sparkles className="w-6 h-6 animate-spin-slow" />
              <h1 className="text-2xl font-bold">Customize Your Style</h1>
              <Shirt className="w-6 h-6 animate-bounce" />
            </div>
          </div>

          {/* Enhanced Clothing Type Navigation Panel */}
          <div className="mb-10">
            <h2 className="text-center text-xl font-bold mb-6 text-gray-800 flex items-center justify-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl shadow-lg animate-pulse">
                <Shirt className="text-white w-6 h-6" />
              </div>
              Choose Your Clothing Type
              <div className="p-2 bg-gradient-to-r from-green-400 to-teal-500 rounded-xl shadow-lg animate-pulse">
                <Sparkles className="text-white w-6 h-6" />
              </div>
            </h2>
            
            <div className="flex flex-wrap justify-center gap-6">
              {clothingOptions.map((option, index) => (
                <button
                  key={option.name}
                  type="button"
                  onClick={() => {
                    setClothingType(option.name);
                    setFormData({ ...formData, measurements: {} }); // Reset measurements
                  }}
                  className={`relative group px-8 py-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 animate-fade-in ${
                    clothingType === option.name
                      ? `bg-gradient-to-r ${option.hoverGradient} text-white shadow-2xl ${option.shadowColor} scale-105 -translate-y-1`
                      : `bg-gradient-to-r ${option.gradient} text-white shadow-xl hover:shadow-2xl ${option.shadowColor}`
                  }`}
                  style={{ 
                    animationDelay: `${index * 200}ms`,
                    boxShadow: clothingType === option.name ? 
                      `0 20px 40px -12px rgba(0, 0, 0, 0.4), 0 0 30px ${option.shadowColor.split('/')[0].replace('shadow-', '')}` : 
                      '0 10px 30px -12px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl animate-bounce group-hover:animate-spin">{option.icon}</span>
                    <span className="group-hover:animate-pulse">{option.name}</span>
                  </div>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  
                  {/* Active Indicator */}
                  {clothingType === option.name && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Global error */}
          {errors.general && (
            <div className="mb-6 flex items-center bg-gradient-to-r from-red-100 to-pink-100 text-red-700 p-5 rounded-2xl shadow-lg border border-red-200 transform transition-all duration-300 animate-slide-down">
              <AlertCircle className="mr-3 animate-bounce" /> 
              <span className="font-semibold">{errors.general}</span>
            </div>
          )}
          {success && (
            <div className="mb-6 flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 p-5 rounded-2xl shadow-lg border border-green-200 transform transition-all duration-300 animate-slide-down">
              <CheckCircle className="mr-3 animate-bounce" /> 
              <span className="font-semibold">{success}</span>
            </div>
          )}

          {/* Fabric, Fabric Color, Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-3 animate-slide-right">
              <label className="flex items-center gap-3 text-sm font-bold text-gray-700">
                <div className="p-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl shadow-lg">
                  <Palette className="w-4 h-4 text-white" />
                </div>
                Fabric Type
              </label>
              <input
                type="text"
                name="fabric"
                placeholder="Cotton, Silk, Denim..."
                value={formData.fabric}
                onChange={handleChange}
                className="border-2 border-purple-200 p-5 rounded-2xl w-full bg-gradient-to-r from-white to-purple-50 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300 transform hover:scale-102 focus:scale-105 shadow-lg hover:shadow-xl text-lg font-medium"
              />
              {errors.fabric && <p className="text-red-500 text-sm mt-1 animate-shake font-semibold">{errors.fabric}</p>}
            </div>

            <div className="space-y-3 animate-slide-left">
              <label className="flex items-center gap-3 text-sm font-bold text-gray-700">
                <div className="w-6 h-6 bg-gradient-to-r from-red-400 to-pink-400 rounded-xl shadow-lg animate-pulse"></div>
                Fabric Color
              </label>
              <input
                type="text"
                name="fabricColor"
                placeholder="Red, Blue, Black..."
                value={formData.fabricColor}
                onChange={handleChange}
                className="border-2 border-pink-200 p-5 rounded-2xl w-full bg-gradient-to-r from-white to-pink-50 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all duration-300 transform hover:scale-102 focus:scale-105 shadow-lg hover:shadow-xl text-lg font-medium"
              />
              {errors.fabricColor && <p className="text-red-500 text-sm mt-1 animate-shake font-semibold">{errors.fabricColor}</p>}
            </div>

            <div className="md:col-span-2 space-y-3 animate-slide-up">
              <label className="flex items-center gap-3 text-sm font-bold text-gray-700">
                <div className="p-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl shadow-lg">
                  <Ruler className="w-4 h-4 text-white" />
                </div>
                Size
              </label>
              <input
                type="text"
                name="size"
                placeholder="M, L, XL or 32, 34..."
                value={formData.size}
                onChange={handleChange}
                className="border-2 border-blue-200 p-5 rounded-2xl w-full bg-gradient-to-r from-white to-blue-50 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-300 transform hover:scale-102 focus:scale-105 shadow-lg hover:shadow-xl text-lg font-medium"
              />
              {errors.size && <p className="text-red-500 text-sm mt-1 animate-shake font-semibold">{errors.size}</p>}
            </div>
          </div>

          {/* Enhanced Measurements */}
          <div className="mb-10">
            <h2 className="font-bold text-2xl mb-6 flex items-center gap-4 text-gray-800 justify-center">
              <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-xl animate-bounce">
                <Scissors className="text-white w-6 h-6" />
              </div>
              <span className="animate-pulse">Measurements (in inches)</span>
              <div className="p-3 bg-gradient-to-r from-teal-400 to-green-500 rounded-2xl shadow-xl animate-bounce delay-300">
                <Ruler className="text-white w-6 h-6" />
              </div>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {measurementFields[clothingType].map((field, index) => (
                <div key={field} className="space-y-3 animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                  <label className="text-sm font-bold text-gray-600 capitalize flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse"></div>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type="text"
                    name={`measurements.${field}`}
                    placeholder={`Enter ${field} measurement`}
                    value={formData.measurements[field] || ""}
                    onChange={handleChange}
                    className="border-2 border-emerald-200 p-5 rounded-2xl w-full bg-gradient-to-r from-white to-emerald-50 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 transform hover:scale-102 focus:scale-105 shadow-lg hover:shadow-xl text-lg font-medium"
                  />
                  {errors[`measurements.${field}`] && (
                    <p className="text-red-500 text-sm mt-1 animate-shake font-semibold">
                      {errors[`measurements.${field}`]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Upload */}
<div className="mb-10">
  <label className="flex items-center gap-4 font-bold text-2xl mb-6 text-gray-800 justify-center">
    <div className="p-3 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl shadow-xl animate-bounce">
      <Upload className="text-white w-6 h-6" />
    </div>
    <span className="animate-pulse">Upload Design (optional)</span>
    <div className="p-3 bg-gradient-to-r from-pink-400 to-red-500 rounded-2xl shadow-xl animate-bounce delay-300">
      <Sparkles className="text-white w-6 h-6" />
    </div>
  </label>
  
  {/* Custom Dropzone Style Input */}
  <div className="relative group">
    <input
      type="file"
      accept="image/*"
      onChange={handleChange}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
    />
    <div className="w-full border-3 border-dashed border-indigo-300 p-10 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 hover:border-indigo-400 hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 cursor-pointer group-hover:scale-102 shadow-lg hover:shadow-xl flex items-center justify-center">
      <div className="text-indigo-600 font-bold text-lg group-hover:scale-110 transition-transform duration-300 flex items-center gap-3">
        <Upload className="w-6 h-6 group-hover:animate-bounce" />
        Click to upload or drag & drop
        <Sparkles className="w-6 h-6 group-hover:animate-spin" />
      </div>
    </div>
  </div>
</div>


          {/* Enhanced Submit Button */}
          <button
            type="submit"
            className="w-full relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 via-pink-500 to-purple-500 text-white font-bold py-6 px-8 rounded-3xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:scale-105 focus:shadow-2xl active:scale-95 group animate-gradient-x shadow-2xl"
            style={{
              backgroundSize: '300% 300%',
              animation: 'gradient-x 4s ease infinite',
            }}
          >
            <div className="flex items-center justify-center gap-4 relative z-10">
              <Sparkles className="w-6 h-6 group-hover:animate-spin" />
              <span className="text-2xl font-black">🎨 Submit Customization 🎨</span>
              <Shirt className="w-6 h-6 group-hover:animate-bounce" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            
            {/* Pulsing Border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400 to-orange-400 opacity-75 blur-sm animate-pulse -z-10"></div>
          </button>
        </form>
      </div>

      {/* Enhanced Custom CSS for animations */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-right {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-left {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }
        
        .animate-slide-right {
          animation: slide-right 0.6s ease-out;
        }
        
        .animate-slide-left {
          animation: slide-left 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        
        .focus\\:scale-105:focus {
          transform: scale(1.05);
        }
        
        .animate-gradient-x {
          background-size: 300% 300%;
          animation: gradient-x 4s ease infinite;
        }
        
        .border-3 {
          border-width: 3px;
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default CustomizationForm;