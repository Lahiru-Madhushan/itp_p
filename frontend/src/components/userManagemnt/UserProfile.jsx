import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  X,
  Home,
  Camera,
  Shield,
  Calendar,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  RefreshCw,
  CreditCard,
  Eye,
} from "lucide-react";
import axios from "axios";
import { useAuthStore } from "../../store/user";
import { useNavigate } from "react-router-dom";
import { API_ROOT } from "../../lib/api";

const UserProfile = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [regularOrders, setRegularOrders] = useState([]);
  const [regularOrdersLoading, setRegularOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    profilePic: null,
  });

  const [errors, setErrors] = useState({});

  // Fetch user data
  const fetchUserData = async () => {
    if (!user || !user._id) {
      setLoading(false);
      setRegularOrdersLoading(false);
      return;
    }

    try {
      setError("");
      setLoading(true);

      // Fetch user data
      const userRes = await axios.get(
        `${API_ROOT}/user/SelectUser/${user._id}`,
        { withCredentials: true }
      );

      if (userRes.data && userRes.data.user) {
        setUserData(userRes.data.user);
        setFormData({
          firstName: userRes.data.user.firstName || "",
          lastName: userRes.data.user.lastName || "",
          email: userRes.data.user.email || "",
          phoneNumber: userRes.data.user.phoneNumber || "",
          address: userRes.data.user.address || "",
          profilePic: null,
        });
      } else {
        throw new Error("User data not found");
      }
    } catch (err) {
      console.error("Error fetching user data", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch regular orders from payment/order system
  const fetchRegularOrders = async () => {
    if (!user || !user._id) {
      setRegularOrdersLoading(false);
      return;
    }

    try {
      setRegularOrdersLoading(true);
      const ordersRes = await axios.get(
        `${API_ROOT}/api/payments/user-orders/${user._id}`,
        { withCredentials: true }
      );
      
      if (ordersRes.data && ordersRes.data.orders) {
        setRegularOrders(ordersRes.data.orders);
      } else {
        setRegularOrders([]);
      }
    } catch (err) {
      console.warn("Could not fetch regular orders:", err.message);
      // If endpoint doesn't exist, try the order endpoint directly
      try {
        const allOrdersRes = await axios.get(
          `${API_ROOT}/order/all`,
          { withCredentials: true }
        );
        
        if (allOrdersRes.data && allOrdersRes.data.orders) {
          // Filter orders for current user
          const userOrders = allOrdersRes.data.orders.filter(
            order => order.userId && order.userId._id === user._id
          );
          setRegularOrders(userOrders);
        } else {
          setRegularOrders([]);
        }
      } catch (secondErr) {
        console.warn("Alternative order fetch also failed:", secondErr.message);
        setRegularOrders([]);
      }
    } finally {
      setRegularOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchRegularOrders();
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800";
      case "out for delivery":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <CreditCard className="h-4 w-4" />;
      case "confirmed":
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "paid":
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "out for delivery":
        return <ShoppingBag className="h-4 w-4" />;
      case "cancelled":
        return <X className="h-4 w-4" />;
      default:
        return <ShoppingBag className="h-4 w-4" />;
    }
  };

  // Profile update functions
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Please enter a valid email";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await axios.put(
        `${API_ROOT}/user/updateUser/${user._id}`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
        },
        { withCredentials: true }
      );

      setUserData({
        ...userData,
        ...formData,
      });

      setEditMode(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating profile", err);
      setError("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        address: userData.address || "",
        profilePic: null,
      });
    }
    setErrors({});
  };

  // Regular Orders Functions
  const handleViewOrderDetails = (order) => {
    // You can implement a modal or redirect to order details page
    console.log("View order details:", order);
    // For now, just show an alert with order info
    alert(`Order Details:\nID: ${order._id}\nStatus: ${order.status}\nTotal: Rs. ${order.total}\nItems: ${order.items?.length || 0}`);
  };

  const retryFetchOrders = () => {
    if (activeTab === "orders") {
      fetchRegularOrders();
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-800 text-lg">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (loading && !userData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-800">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 text-lg">Failed to load user data.</p>
          <button 
            onClick={fetchUserData}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-lg flex items-center space-x-1 shadow-lg z-10"
      >
        <Home className="h-4 w-4" />
        <span>Home</span>
      </button>

      {updateSuccess && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-20 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>Operation completed successfully!</span>
        </div>
      )}

      {error && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-20 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <button 
            onClick={() => setError("")}
            className="ml-4 hover:bg-red-600 rounded-full p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information and orders</p>
        </div>

        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-3 font-medium text-lg border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "profile"
                ? "border-yellow-500 text-yellow-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <User className="inline mr-2 h-5 w-5" />
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 font-medium text-lg border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "orders"
                ? "border-yellow-500 text-yellow-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <ShoppingBag className="inline mr-2 h-5 w-5" />
            My Orders ({regularOrders.length})
          </button>
        </div>

        {activeTab === "profile" && userData && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="relative h-32 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>

            <div className="relative px-8 pb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 mb-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center overflow-hidden">
                    {userData?.profilePic ? (
                      <img
                        src={userData.profilePic}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-white" />
                    )}
                  </div>
                  <button className="absolute bottom-2 right-2 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                  <h2 className="text-3xl font-bold text-gray-800">
                    {userData.firstName} {userData.lastName}
                  </h2>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-gray-800">
                      <Shield className="h-4 w-4 mr-1" />
                      {userData.role || "User"}
                    </span>
                    <span className="text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Member since {formatDate(userData.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {!editMode ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-yellow-600" />
                      <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <p className="text-gray-800 font-medium">{userData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-yellow-600" />
                      <div>
                        <label className="text-sm text-gray-600">Phone</label>
                        <p className="text-gray-800 font-medium">{userData.phoneNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-yellow-600" />
                      <div>
                        <label className="text-sm text-gray-600">Address</label>
                        <p className="text-gray-800 font-medium">{userData.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <Shield className="h-5 w-5 text-yellow-600" />
                      <div>
                        <label className="text-sm text-gray-600">Role</label>
                        <p className="text-gray-800 font-medium capitalize">
                          {userData.role || "user"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="border p-3 rounded-lg w-full"
                      placeholder="First Name"
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="border p-3 rounded-lg w-full"
                      placeholder="Last Name"
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="border p-3 rounded-lg w-full"
                      placeholder="Email"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="border p-3 rounded-lg w-full"
                      placeholder="Phone"
                    />
                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="border p-3 rounded-lg w-full"
                      placeholder="Address"
                      rows="3"
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div className="flex gap-4 col-span-2 justify-center mt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 px-6 py-2 rounded-lg text-gray-900 font-semibold"
                    >
                      <Save className="inline mr-2 h-5 w-5" />
                      {loading ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-700 hover:bg-gray-800 px-6 py-2 rounded-lg text-white font-semibold"
                    >
                      <X className="inline mr-2 h-5 w-5" />
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {!editMode && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-800 font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    <Edit3 className="h-5 w-5" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">My Orders</h2>
              <button
                onClick={retryFetchOrders}
                disabled={regularOrdersLoading}
                className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg"
              >
                <RefreshCw className={`h-4 w-4 ${regularOrdersLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {regularOrdersLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                <p className="text-gray-800">Loading your orders...</p>
              </div>
            ) : regularOrders.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-4">Start shopping to see your orders here!</p>
                <button
                  onClick={() => navigate("/products")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-2 rounded-lg font-medium"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              regularOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Order #{order._id?.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                      {order.paymentId && (
                        <p className="text-sm text-gray-500">Payment ID: {order.paymentId}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-2 lg:mt-0">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status || "Unknown"}</span>
                      </span>
                      <span className="text-lg font-bold text-yellow-600">
                        Rs. {order.total || "0.00"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Items</h4>
                      <div className="space-y-2">
                        {order.items?.map((item, index) => (
                          <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                            {item.images?.[0] && (
                              <img
                                src={`${API_ROOT}${item.images[0]}`}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                Rs. {item.finalPrice || item.price} × {item.quantity}
                              </p>
                              {item.customizations && Object.keys(item.customizations).length > 0 && (
                                <p className="text-xs text-gray-500">
                                  Customizations: {Object.keys(item.customizations).join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Order Actions</h4>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleViewOrderDetails(order)}
                            className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <h4 className="font-semibold text-yellow-800 mb-1">Order Summary</h4>
                        <div className="text-sm text-yellow-700">
                          <p>Items: {order.items?.length || 0}</p>
                          <p>Total: Rs. {order.total || "0.00"}</p>
                          <p>Status: <span className="capitalize">{order.status}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;