// src/components/NavigationBar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, Menu, X, Zap, Shield, Truck } from "lucide-react";
import { useAuthStore } from "../store/user";
import CartDropdown from "./productManagement/CartDropdown";

const NavigationBar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Cart state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const cartRef = useRef(null);

  const profileRef = useRef(null);
  const menuRef = useRef(null);
  const location = useLocation();

  const navigationItems = [
    { name: "Home", href: "/" },
    { name: "Mensware", href: "/Mensware" },
    { name: "Femaleware", href: "/FemaleWarePage" },
    { name: "Kidsware", href: "/KidswarePage" },
    { name: "Customize Clothes", href: "/customize", special: true },
    { name: "Reviews", href: "/Feedback" },
  ];

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setIsProfileOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target))
        setIsMenuOpen(false);
      if (cartRef.current && !cartRef.current.contains(e.target))
        setIsCartOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load & sync cart from localStorage
  useEffect(() => {
    const loadCart = () => {
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCart(savedCart);
    };
    loadCart();
    window.addEventListener("storage", loadCart);
    return () => window.removeEventListener("storage", loadCart);
  }, []);

  // ⭐ Show notification when cart updates
  useEffect(() => {
    if (cart.length === 0) return;
    const notification = document.createElement("div");
    notification.className =
      "fixed top-20 right-4 bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl shadow-2xl z-[9999] transition-all duration-500";
    notification.innerText = "✓ Item added to cart!";
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateY(-10px)";
      setTimeout(() => notification.remove(), 500);
    }, 1500);
  }, [cart]);

  // Remove item from cart
  const handleRemoveItem = async (id, qty = 1) => {
    try {
      await fetch("http://localhost:8070/product/removeFromCart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, quantity: qty }),
      });

      const updated = cart.filter((item) => item._id !== id);
      setCart(updated);
      localStorage.setItem("cart", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  return (
    <div className="w-full">
      {/* Top Promo Bar */}
      <div className="bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20"></div>
        <div className="relative text-center py-2 px-4 text-sm font-medium">
          <div className="flex items-center justify-center gap-2 animate-pulse">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-yellow-400">FLASH SALE:</span>
            <span>Sign up & get 30% OFF + FREE shipping worldwide!</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`bg-white relative overflow-visible transition-all duration-300 ${
          isScrolled
            ? "shadow-2xl shadow-yellow-500/20"
            : "shadow-xl shadow-yellow-500/10"
        } sticky top-0 z-50`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-50 via-white to-yellow-50 opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0 relative group">
              <Link to="/" className="flex items-center">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl opacity-0 group-hover:opacity-20 transition-all duration-300"></div>
                  <div className="relative text-3xl font-black tracking-tight">
                    <span className="text-black">YONG</span>
                    <span className="text-yellow-500 ml-2 drop-shadow-lg">
                      SMART
                    </span>
                  </div>
                  <div className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 group-hover:w-full transition-all duration-500 rounded-full"></div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2 ml-10">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 relative overflow-hidden ${
                    location.pathname === item.href
                      ? "text-black bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg transform scale-105"
                      : item.special
                      ? "text-white bg-gradient-to-r from-black to-gray-800 hover:from-yellow-500 hover:to-yellow-400 hover:text-black shadow-lg hover:scale-105"
                      : "text-gray-700 hover:text-black hover:bg-gradient-to-r hover:from-yellow-100 hover:to-yellow-200 hover:shadow-md hover:scale-105"
                  }`}
                >
                  {item.name}
                  {item.special && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                  )}
                </Link>
              ))}
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-3">
              {/* ⭐ Cart Button */}
              <div className="relative" ref={cartRef}>
                <button
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className="p-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold shadow-lg hover:scale-110 transition-transform relative"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {cart.length > 0 && (
                    <div className="absolute -top-1 -right-1 bg-black text-yellow-400 text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-md animate-bounce">
                      {cart.length}
                    </div>
                  )}
                </button>

                {isCartOpen && (
                  <CartDropdown cart={cart} onRemove={handleRemoveItem} />
                )}
              </div>

              {/* ⭐ Profile (transparent default, yellow on hover) */}
              <div className="relative" ref={profileRef}>
                {isAuthenticated ? (
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-transparent text-black font-bold shadow-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-yellow-400 hover:to-yellow-500 hover:scale-110"
                  >
                    <User className="h-6 w-6" />
                  </button>
                ) : (
                  <Link
                    to="/register"
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-transparent text-black font-bold shadow-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-yellow-400 hover:to-yellow-500 hover:scale-110"
                  >
                    <User className="h-6 w-6" />
                  </Link>
                )}

                {isProfileOpen && isAuthenticated && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border-2 border-yellow-200 py-3 z-50 overflow-visible">
                    <div className="relative px-6 py-4 border-b border-yellow-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-black" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-black">
                            {user?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="relative py-3">
                      <Link
                        to="/profile"
                        className="flex items-center px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-yellow-100 hover:to-yellow-200 hover:text-black transition-all duration-300 group"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="h-5 w-5 mr-3" /> My Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-yellow-100 hover:to-yellow-200 hover:text-black transition-all duration-300 group"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <ShoppingCart className="h-5 w-5 mr-3" /> My Orders
                      </Link>
                      <Link
                        to="/reviews"
                        className="flex items-center px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-yellow-100 hover:to-yellow-200 hover:text-black transition-all duration-300 group"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="h-5 w-5 mr-3" /> My Reviews
                      </Link>
                      <div className="border-t border-yellow-200 my-3 mx-6"></div>
                      <button
                        onClick={() => {
                          logout?.();
                          setIsProfileOpen(false);
                        }}
                        className="flex items-center w-full px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 group"
                      >
                        <X className="h-5 w-5 mr-3" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-3 text-gray-600 hover:text-black hover:bg-gradient-to-r hover:from-yellow-100 hover:to-yellow-200 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-yellow-400/30 relative overflow-hidden"
                >
                  {isMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-gradient-to-br from-white via-yellow-50 to-white border-t-2 border-yellow-200 shadow-2xl">
            <div className="px-4 pt-4 pb-6 space-y-3 sm:px-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-6 py-4 rounded-xl text-base font-bold text-gray-700 hover:text-black hover:bg-gradient-to-r hover:from-yellow-100 hover:to-yellow-200 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Secondary Info Bar */}
      <div className="bg-gradient-to-r from-yellow-100 via-yellow-50 to-yellow-100 border-b border-yellow-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-12 text-sm font-semibold text-gray-700">
          <div className="flex items-center space-x-2 group cursor-pointer hover:scale-105 transition-transform duration-300">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="group-hover:text-black transition-colors duration-300">
              Free Worldwide Shipping
            </span>
          </div>
          <div className="flex items-center space-x-2 group cursor-pointer hover:scale-105 transition-transform duration-300">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="group-hover:text-black transition-colors duration-300">
              30-Day Easy Returns
            </span>
          </div>
          <div className="flex items-center space-x-2 group cursor-pointer hover:scale-105 transition-transform duration-300">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="group-hover:text-black transition-colors duration-300">
              24/7 Premium Support
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
