import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  MessageCircle 
} from 'lucide-react';
import Footer from "./Footer";

const ContactPage = () => {
  // Shop location coordinates (you can change these to your actual shop location)
  const shopLocation = {
    lat: 5.9440213344407145, // Example: New York Fashion District5., 
    lng: 80.54919405343878,
    address: "271/3 , sea Road ,Matara\nSri Lanka"
  };


  // Function to open location in Google Maps
  const openInMaps = () => {
    const url = `https://www.google.com/maps?q=${shopLocation.lat},${shopLocation.lng}`;
    window.open(url, '_blank');
  };

  // Function to open directions in Google Maps
  const getDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${shopLocation.lat},${shopLocation.lng}`;
    window.open(url, '_blank');
  };

  const contactItems = [
    {
      icon: MapPin,
      title: "Visit Our Store",
      details: shopLocation.address,
      action: openInMaps,
      actionText: "View on Map"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "(+94) 71 9245 485\nMon-Sat: 9AM - 8PM",
      action: () => window.open('tel:+15551234567'),
      actionText: "Call Now"
    },
    {
      icon: Mail,
      title: "Email Us",
      details: "info@yongsmart.com\nsupport@yongsmart.com",
      action: () => window.open('mailto:info@yongsmart.com'),
      actionText: "Send Email"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      details: "Available 24/7\nInstant support online",
      action: () => alert("Live chat feature coming soon!"),
      actionText: "Start Chat"
    }
  ];

  const socialLinks = [
    {
      name: "Twitter",
      url: "#",
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
        </svg>
      )
    },
    {
      name: "Facebook",
      url: "#",
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: "Instagram",
      url: "#",
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      name: "Pinterest",
      url: "#",
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-5 w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Yong Smart
          </h1>
          <p className="text-xl text-gray-600 font-light">
            Get in touch with us - We're here to help!
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Contact Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-yellow-200/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-size-200 animate-pulse"></div>
            
            <h2 className="text-3xl font-semibold text-gray-900 mb-8">
              Contact Information
            </h2>
            
            <div className="space-y-6">
              {contactItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start p-4 rounded-xl hover:bg-yellow-50/50 transition-all duration-300 hover:translate-x-2 cursor-pointer group"
                  onClick={item.action}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mr-5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                    <item.icon className="w-6 h-6 text-gray-900" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                      {item.details}
                    </p>
                    <button className="mt-2 text-orange-600 text-sm font-medium hover:text-orange-700 transition-colors">
                      {item.actionText} →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Business Hours */}
            <div className="mt-10 p-6 bg-yellow-50/50 rounded-2xl border-l-4 border-yellow-400">
              <h3 className="text-xl font-semibold text-gray-900 mb-5">
                Store Hours
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-yellow-200/50">
                  <span className="font-medium text-gray-900">Monday - Friday</span>
                  <span className="text-gray-600">9:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-yellow-200/50">
                  <span className="font-medium text-gray-900">Saturday</span>
                  <span className="text-gray-600">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-gray-900">Sunday</span>
                  <span className="text-gray-600">11:00 AM - 5:00 PM</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-10 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-5">
                Follow Us
              </h3>
              <div className="flex justify-center space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl text-gray-900"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white/90 rounded-3xl overflow-hidden shadow-2xl border border-yellow-200/50">
            <div className="p-8 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 border-b border-yellow-200/50">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Find Us
              </h2>
              <p className="text-gray-600">
                Located in the heart of the fashion district
              </p>
            </div>
            
            {/* Interactive Map Area */}
            <div className="relative h-80 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden group cursor-pointer">
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              
              {/* Map Content */}
              <div 
                className="h-full flex flex-col items-center justify-center relative z-10 p-8"
                onClick={openInMaps}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-xl animate-bounce mb-4">
                  <MapPin className="w-8 h-8 text-gray-900" />
                </div>
                <p className="text-gray-700 text-center font-medium mb-4">
                  Click to view our location on Google Maps
                </p>
                <div className="flex space-x-4">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openInMaps();
                    }}
                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-lg transition-colors"
                  >
                    View on Map
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      getDirections();
                    }}
                    className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-gray-900 font-medium rounded-lg transition-colors"
                  >
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default ContactPage;