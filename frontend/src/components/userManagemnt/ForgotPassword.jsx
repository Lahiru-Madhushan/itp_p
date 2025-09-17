import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/user";
import { X, Mail, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { forgotPassword, isLoading } = useAuthStore();

  const closeToHome = () => navigate("/");
  const stop = (e) => e.stopPropagation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      toast.success("Reset link sent (if the email exists).");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send reset email");
    }
  };

  return (
    <div className="fixed inset-0 flex z-50" onClick={closeToHome}>
      {/* Left shaded overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-b from-black/40 via-black/20 to-black/10">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Right form panel */}
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

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password</h2>

            {!isSubmitted ? (
              <>
                <p className="text-gray-600 mb-6">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition-all duration-200"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-800 font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              </>
            ) : (
              <div className="mt-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-600">
                  If an account exists for <b>{email}</b>, you will receive a password reset link shortly.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto flex justify-center pt-4">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-green-500 hover:underline text-sm font-medium flex items-center gap-1"
          >
            ← Back to Login
          </button>
        </div>
      </aside>
    </div>
  );
};

export default ForgotPassword;
