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
} from "lucide-react";
import axios from "axios";
import { useAuthStore } from "../../store/user";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate

const UserProfile = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate(); // ✅ Initialize navigate
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
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
  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;
      try {
        const res = await axios.get(
          `http://localhost:8070/user/SelectUser/${user._id}`,
          { withCredentials: true }
        );
        setUserData(res.data.user);
        setFormData({
          firstName: res.data.user.firstName || "",
          lastName: res.data.user.lastName || "",
          email: res.data.user.email || "",
          phoneNumber: res.data.user.phoneNumber || "",
          address: res.data.user.address || "",
          profilePic: null,
        });
      } catch (err) {
        console.error("Error fetching user data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [user]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

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
        `http://localhost:8070/user/updateUser/${user._id}`,
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
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      address: userData.address,
      profilePic: null,
    });
    setErrors({});
  };

  if (!isAuthenticated) {
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

  return (
    <div className="min-h-screen bg-white relative">
      {/* ✅ Home Button Top-Right */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-lg flex items-center space-x-1 shadow-lg"
      >
        <Home className="h-4 w-4" />
        <span>Home</span>
      </button>

      {/* ✅ Success Toast */}
      {updateSuccess && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-20 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Cover Section */}
          <div className="relative h-32 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>

          {/* Profile Content */}
          <div className="relative px-8 pb-8">
            {/* Profile Picture */}
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
                    {userData.role}
                  </span>
                  <span className="text-gray-600 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Member since {formatDate(userData.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Info / Edit */}
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
                        {userData.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="border p-3 rounded-lg"
                  placeholder="First Name"
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="border p-3 rounded-lg"
                  placeholder="Last Name"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border p-3 rounded-lg"
                  placeholder="Email"
                />
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="border p-3 rounded-lg"
                  placeholder="Phone"
                />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="border p-3 rounded-lg md:col-span-2"
                  placeholder="Address"
                />

                <div className="flex gap-4 col-span-2 justify-center mt-4">
                  <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-600 px-6 py-2 rounded-lg text-gray-900 font-semibold"
                  >
                    <Save className="inline mr-2 h-5 w-5" />
                    Save
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
      </div>
    </div>
  );
};

export default UserProfile;
