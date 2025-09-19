import React, { useEffect, useState } from "react";
import { Search, Download, Trash2, User, Filter } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { generateUsersPDF } from "./userPDF"; 

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [logoUrl, setLogoUrl] = useState("");
  
  // Load the logo from public directory
  useEffect(() => {
    // This path is relative to the public folder
    setLogoUrl("/images/logo1.jpg");
    
    // For testing if the logo exists
    fetch("/images/logo1.png")
      .then(response => {
        if (!response.ok) {
          console.warn("Logo not found at /images/logo1.png");
          setLogoUrl(""); // Clear if not found
        }
      })
      .catch(error => {
        console.error("Error checking logo:", error);
        setLogoUrl(""); // Clear on error
      });
  }, []);

  // Mock data for demonstration - replace with your actual API call
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Replace with your actual API call:
        const res = await fetch("http://localhost:8070/user/AllUser", {
          credentials: "include",
        });
        const data = await res.json();
        setUsers(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        // Fallback to mock data if API fails
        setTimeout(() => {
          setUsers(mockData);
          setLoading(false);
        }, 1000);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`http://localhost:8070/user/deleteUser/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

const handleDownloadPDF = async () => {
  const doc = await generateUsersPDF(filteredUsers);
  doc.save("Users_Report.pdf");
};

  // Filter users based on search term and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      (user.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || (user.role || '').toLowerCase() === roleFilter.toLowerCase();
    
    return matchesSearch && matchesRole;
  });

  // Get unique roles for filter dropdown
  const uniqueRoles = [...new Set(users.map(user => user.role))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                <p className="text-gray-600">Manage and view all registered users</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{filteredUsers.length}</p>
              <p className="text-gray-600">Total Users</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Role Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 appearance-none bg-white min-w-[140px]"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  {uniqueRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Download className="h-5 w-5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Address</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <tr key={user._id} className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'Admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : user.role === 'Manager'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No users found</div>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-4">
          <div className="text-center text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock data for demonstration
const mockData = [
  {
    _id: "1",
    firstName: "John",
    lastName: "Doe",
    address: "123 Main St, City, Country",
    phoneNumber: "+94 123 4567",
    email: "john.doe@example.com",
    role: "Admin"
  },
  {
    _id: "2",
    firstName: "Jane",
    lastName: "Smith",
    address: "456 Oak Ave, Town, Country",
    phoneNumber: "+94 987 6543",
    email: "jane.smith@example.com",
    role: "Manager"
  },
  {
    _id: "3",
    firstName: "Robert",
    lastName: "Johnson",
    address: "789 Pine Rd, Village, Country",
    phoneNumber: "+94 555 1234",
    email: "robert.j@example.com",
    role: "User"
  }
];

export default Users;