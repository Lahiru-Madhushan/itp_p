import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, Star, TrendingUp, Zap } from 'lucide-react';
import Footer from "./Footer";
import ChatBot from "./AI/chatbot"
const Homepage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = ['images/navigate1.png', 'images/navigate2.jpg', 'images/navigate3.jpg'];

  // Auto-slide carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const categories = [
    { name: "Men's Fashion", items: '50+ Items', icon: <TrendingUp className="w-8 h-8" /> },
    { name: "Women's Fashion", items: '80+ Items', icon: <Star className="w-8 h-8" /> },
    { name: 'Customize Items', items: '', icon: <Zap className="w-8 h-8" /> },
    { name: 'Child Wear', items: '90+ Items', icon: <ShoppingBag className="w-8 h-8" /> }
  ];

  return (
    
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #ffffff 60%, #fbbf24 30%, #000000 10%)' }}>
      
      {/* Hero Section with Carousel */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-white/80 to-black/10"></div>

        {/* Image Carousel */}
        <div className="relative w-full h-full">
          <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl">
            {images.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  index === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
              >
                <img src={image} alt={`Navigation ${index + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button onClick={prevImage} className="absolute left-8 top-1/2 -translate-y-1/2 bg-yellow-400 hover:bg-yellow-500 text-black p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={nextImage} className="absolute right-8 top-1/2 -translate-y-1/2 bg-yellow-400 hover:bg-yellow-500 text-black p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110">
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Shop Now Button above dots */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20">
            <button className="bg-black text-yellow-400 px-8 py-4 rounded-full font-semibold text-lg hover:bg-yellow-400 hover:text-black transition-all duration-300 hover:scale-105 shadow-xl">
              Shop Now
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? 'bg-yellow-400 w-8' : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Floating Brand Title (moved higher) 
        <div className="absolute top-1/5 left-1/2 -translate-x-1/2 text-center z-10">
          <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-black to-yellow-400 mb-4 tracking-tight">
            YONG SMART
          </h1>
          <p className="text-xl text-black/80 font-medium max-w-md mx-auto">
            Elevate Your Style with Smart Fashion Choices
          </p>
        </div>*/}
      </section>

      {/* Categories Section */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 text-black">
            Shop by <span className="text-yellow-400">Category</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <div
                key={index}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-yellow-400/20 hover:border-yellow-400/50"
              >
                <div className="text-yellow-400 mb-4 group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                <h3 className="text-xl font-bold text-black mb-2">{category.name}</h3>
                <p className="text-black/60">{category.items}</p>
                <div className="mt-4 text-yellow-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  Explore →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Attractive Promo Section */}
      <section className="py-24 px-8 bg-gradient-to-r from-yellow-400/20 via-white/70 to-black/10">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <h2 className="text-5xl font-extrabold text-black mb-6">
              Limited Time <span className="text-yellow-400">Exclusive Offers!</span>
            </h2>
            <p className="text-xl text-black/80 mb-8">
              Upgrade your wardrobe with our smart fashion collection. Grab your favorites before they're gone!
            </p>
            <button className="bg-black text-yellow-400 px-10 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 hover:text-black transition-all duration-300 hover:scale-105 shadow-xl">
              Explore Deals
            </button>
          </div>
          
        </div>
      </section>

      <ChatBot/>
      <Footer />
    </div>
  );
};

export default Homepage;
