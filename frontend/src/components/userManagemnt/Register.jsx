import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/user";
import { Eye, EyeOff, User, Mail, Phone, MapPin, Lock, X, CheckCircle } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    address: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { signup, error, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "password") checkPasswordStrength(value);
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "#ef4444";
    if (passwordStrength <= 50) return "#f59e0b";
    if (passwordStrength <= 75) return "#3b82f6";
    return "#10b981";
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return "First name is required";
    if (!formData.lastName.trim()) return "Last name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return "Please enter a valid email";
    if (!formData.contact.trim()) return "Phone number is required";
    if (!formData.address.trim()) return "Address is required";
    if (formData.password.length < 8) return "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    if (!agreedToTerms) return "Please agree to the terms and conditions";
    return null;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) return alert(validationError);

    try {
      await signup(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.contact,
        formData.address,
        formData.password,
        formData.confirmPassword
      );
      navigate("/verify-email");
    } catch (err) {
      console.log(err);
    }
  };

  const closeToHome = () => navigate("/");
  const stop = (e) => e.stopPropagation();

  return (
    <div className="fixed inset-0 flex z-50" onClick={closeToHome}>
      {/* Left shaded overlay */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-b from-black/40 via-black/20 to-black/10"
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Right Registration Form */}
      <aside
        onClick={stop}
        className="w-full lg:w-1/2 bg-white flex flex-col relative overflow-y-auto p-8"
      >
        {/* Close Button */}
        <button
          onClick={closeToHome}
          className="absolute top-6 right-6 z-20 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all duration-200"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Hello There!</h2>
            <p className="text-center text-gray-600 mb-6">
              Glad to see you joining with us. Please fill up the following fields to set your account up.
            </p>

            <form className="space-y-4" onSubmit={handleSignUp}>
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition-all duration-200"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition-all duration-200"
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition-all duration-200"
                />
              </div>

              {/* Address */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition-all duration-200"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Strength */}
              {formData.password && (
                <div className="space-y-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ width: `${passwordStrength}%`, backgroundColor: getPasswordStrengthColor() }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600">
                    Password Strength: {passwordStrength <= 25 ? 'Weak' : passwordStrength <= 50 ? 'Fair' : passwordStrength <= 75 ? 'Good' : 'Strong'}
                  </p>
                </div>
              )}

              {/* Confirm Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {formData.confirmPassword && (
                  <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                    {formData.password === formData.confirmPassword ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <a href="#" className="text-yellow-600 hover:underline font-medium">
                    Terms & Conditions
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !agreedToTerms}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-800 font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                {isLoading ? "Creating Account..." : "Create My Account"}
              </button>

              {/* Login Link */}
              <div className="text-center pt-4 border-t border-gray-200">
                <span className="text-gray-600">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-yellow-600 font-semibold hover:text-yellow-700 transition-colors duration-200"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Register;
