import React, { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  CreditCard,
  MessageSquare,
  Package,
  Settings,
  Menu,
  X,
  LogOut,
  Layers,
  Truck,
  ClipboardList,
  Home,
  ChevronRight
} from "lucide-react";

import UserManagement from "./userManagemnt/userManagement";
import Customization from "./customization/CustomizationAdmin";
import Rawmaterial from "./Raw/readRaw";
import Product from "../components/productManagement/AdminProducts";
import SupplierEmail from "./supplier/SupplierEmail"; 
import FeedbackPage from "./Feedback/AdminFeedback";
import Chart from "./Chart";
import PaymentManager from "./paymentManagement/paymentAdmin";
import AdminOrders from "./orderManagement/AdminOrders";
import { useAuthStore } from "../store/user";

const AdminDashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();

  // Navigation items grouped by category
  const navigationSections = [
    {
      title: "Overview",
      items: [
        { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/admin/dashboard" },
      ]
    },
    {
      title: "Customer Management",
      items: [
        { id: "user-management", label: "Users", icon: Users, path: "/admin/dashboard/All-user" },
        { id: "orders", label: "Orders", icon: ClipboardList, path: "/admin/dashboard/orders" },
        { id: "feedback", label: "Reviews", icon: MessageSquare, path: "/admin/dashboard/feedback" },
      ]
    },
    {
      title: "Business Operations",
      items: [
        { id: "product-management", label: "Products", icon: Package, path: "/admin/dashboard/products" },
        { id: "inventory-management", label: "Inventory", icon: Layers, path: "/admin/dashboard/inventory" },
        { id: "supplier-management", label: "Suppliers", icon: Truck, path: "/admin/dashboard/suppliers" },
        { id: "customization-management", label: "Customization", icon: Settings, path: "/admin/dashboard/settings" },
        { id: "payment", label: "Payments", icon: CreditCard, path: "/admin/dashboard/payment" },
      ]
    }
  ];

  const handleNavigation = (item) => {
    navigate(item.path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout?.();
    navigate("/login");
  };

  // Get current page title for breadcrumb
  const getCurrentPageTitle = () => {
    const allItems = navigationSections.flatMap(section => section.items);
    const currentItem = allItems.find(item => item.path === location.pathname);
    return currentItem?.label || "Dashboard";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className={`
        hidden lg:flex flex-col bg-white shadow-lg transition-all duration-300
        ${isSidebarCollapsed ? 'w-20' : 'w-64'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-500">Welcome back!</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {navigationSections.map((section, index) => (
            <div key={index}>
              {!isSidebarCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item)}
                      className={`
                        flex items-center w-full p-3 rounded-xl text-sm font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                        ${isSidebarCollapsed ? 'justify-center' : ''}
                      `}
                      title={isSidebarCollapsed ? item.label : ''}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      {!isSidebarCollapsed && (
                        <span className="ml-3">{item.label}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isSidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">Administrator</p>
                </div>
              </div>
            )}
            
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${isSidebarCollapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className={`
              flex items-center w-full mt-4 p-3 rounded-xl text-sm font-medium text-red-600 
              hover:bg-red-50 transition-all duration-200
              ${isSidebarCollapsed ? 'justify-center' : ''}
            `}
            title={isSidebarCollapsed ? "Logout" : ""}
          >
            <LogOut className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="px-4 sm:px-6 flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-500">{getCurrentPageTitle()}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-red-600 hover:bg-red-100"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden bg-white border-t border-gray-200 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {navigationSections.map((section, index) => (
                <div key={index} className="border-b border-gray-100 last:border-b-0">
                  <h3 className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    {section.title}
                  </h3>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item)}
                        className={`
                          flex items-center w-full px-4 py-3 text-left border-l-4 transition-colors
                          ${isActive 
                            ? 'bg-blue-50 text-blue-700 border-blue-600' 
                            : 'border-transparent text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </header>

        {/* Breadcrumb & Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center text-sm text-gray-600">
            <Home className="h-4 w-4 mr-2" />
            <span>Admin</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="font-medium text-gray-900">{getCurrentPageTitle()}</span>
          </div>

          {/* Page Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <Routes>
              <Route index element={<Chart />} />
              <Route path="All-user" element={<UserManagement />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="payment" element={<PaymentManager />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="products" element={<Product />} />
              <Route path="settings" element={<Customization />} />
              <Route path="inventory" element={<Rawmaterial />} />
              <Route path="suppliers" element={<SupplierEmail />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;