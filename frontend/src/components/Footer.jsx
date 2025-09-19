import React from "react";

const Footer = () => {
  return (
    <footer className="footer bg-black text-white py-12 text-center">
      <div className="container mx-auto px-4">
        {/* Brand */}
        <div className="footer-brand text-3xl font-bold mb-4">
          <span
            className="text-white"
            style={{
              WebkitTextStroke: "1px white", // White outline
              textStroke: "1px white",
            }}
          >
            Yong
          </span>{" "}
          <span
            className="text-yellow-400"
            style={{
              WebkitTextStroke: "1px white", // White outline
              textStroke: "1px white",
            }}
          >
            Smart
          </span>
        </div>

        <p className="footer-text text-gray-400 mb-6">
          Premium Fashion & Custom Tailoring
        </p>

        <div className="footer-links flex flex-wrap justify-center gap-6 mb-6">
          <a href="/AboutUsPage" className="hover:text-yellow-400 transition-colors duration-300">About Us</a>
          <a href="#" className="hover:text-yellow-400 transition-colors duration-300">Ready-Made</a>
          <a href="#" className="hover:text-yellow-400 transition-colors duration-300">Custom Orders</a>
          <a href="/files/Yong_Smart_size_chart.pdf" download className="hover:text-yellow-400 transition-colors duration-300">Size Guide</a>
          <a href="/ContactPage" className="hover:text-yellow-400 transition-colors duration-300">Contact</a>
          <a href="/FaqPage" className="hover:text-yellow-400 transition-colors duration-300">FAQ</a>
        </div>

        <div className="footer-bottom border-t border-gray-800 pt-6 text-gray-500">
          &copy; 2025 Yong Smart. All rights reserved. | Crafted with passion for fashion.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
