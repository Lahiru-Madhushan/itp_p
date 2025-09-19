import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Package, Palette, Truck, CreditCard, RotateCcw, Ruler, Clock } from 'lucide-react';
import Footer from "./Footer";

const FaqPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (id) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const categories = [
    { id: 'all', name: 'All Questions', icon: Package, color: 'text-yellow-600' },
    { id: 'orders', name: 'Orders & Shipping', icon: Truck, color: 'text-yellow-600' },
    { id: 'customization', name: 'Customization', icon: Palette, color: 'text-yellow-600' },
    { id: 'sizing', name: 'Sizing & Fit', icon: Ruler, color: 'text-yellow-600' },
    { id: 'payment', name: 'Payment & Returns', icon: CreditCard, color: 'text-yellow-600' },
    { id: 'care', name: 'Care & Maintenance', icon: RotateCcw, color: 'text-yellow-600' }
  ];

  const faqs = [
    // Orders & Shipping
    {
      id: 1,
      category: 'orders',
      question: 'How long does it take to process and ship my order?',
      answer: 'Ready-made clothing orders are processed within 1-2 business days and shipped within 3-5 business days. Custom clothing orders require 7-14 business days for production, plus 3-5 business days for shipping. You\'ll receive tracking information once your order ships.'
    },
    {
      id: 2,
      category: 'orders',
      question: 'Do you offer international shipping?',
      answer: 'Yes! We ship worldwide. International shipping typically takes 7-21 business days depending on your location. Customs fees and import duties may apply and are the responsibility of the customer. We provide tracking for all international shipments.'
    },
    {
      id: 3,
      category: 'orders',
      question: 'Can I track my order?',
      answer: 'Absolutely! Once your order ships, you\'ll receive a tracking number via email. You can track your package on our website or directly through the shipping carrier\'s website. For custom orders, we also provide production updates.'
    },
    {
      id: 4,
      category: 'orders',
      question: 'What if my order arrives damaged or incorrect?',
      answer: 'We\'re sorry if there\'s an issue with your order! Please contact us within 48 hours of delivery with photos of the damaged or incorrect items. We\'ll arrange for a replacement or full refund, and we\'ll cover all return shipping costs.'
    },

    // Customization
    {
      id: 5,
      category: 'customization',
      question: 'What customization options do you offer?',
      answer: 'We offer extensive customization including: custom sizing, fabric selection, color changes, embroidery, screen printing, appliqué work, button and zipper options, and design modifications. You can also submit your own designs for completely custom pieces.'
    },
    {
      id: 6,
      category: 'customization',
      question: 'How do I submit my custom design?',
      answer: 'You can upload your design files (PNG, JPG, PDF, or AI formats) during checkout, or email them to custom@yourstore.com. Our design team will review your submission and contact you within 24 hours with a quote and timeline. We also offer free design consultations.'
    },
    {
      id: 7,
      category: 'customization',
      question: 'Can I see a preview before my custom item is made?',
      answer: 'Yes! For all custom orders, we provide digital mockups or sketches for your approval before production begins. You can request up to 3 revisions at no extra cost. Production only starts after you approve the final design.'
    },
    {
      id: 8,
      category: 'customization',
      question: 'Is there a minimum order quantity for custom items?',
      answer: 'For individual custom pieces, there\'s no minimum order. For bulk custom orders (10+ pieces), we offer volume discounts. Wedding parties, corporate orders, and team uniforms qualify for special group pricing.'
    },

    // Sizing & Fit
    {
      id: 9,
      category: 'sizing',
      question: 'How do I find my correct size?',
      answer: 'Use our detailed size guide with measurements for chest, waist, hips, and length. We recommend measuring yourself or having someone help you for accuracy. For custom orders, we can create pieces based on your exact measurements.'
    },
    {
      id: 10,
      category: 'sizing',
      question: 'What if the size doesn\'t fit properly?',
      answer: 'Ready-made items can be exchanged for a different size within 30 days if unworn and with tags attached. For custom-sized items, we offer one free minor alteration within 14 days of delivery. Major fit issues will be remade at no charge.'
    },
    {
      id: 11,
      category: 'sizing',
      question: 'Do you offer plus sizes?',
      answer: 'Yes! Our ready-made collection includes sizes XS to 3XL, and our custom service can create clothing in any size. We believe fashion should be inclusive and accessible to everyone, regardless of body type or size.'
    },
    {
      id: 12,
      category: 'sizing',
      question: 'Can you help with fit adjustments after purchase?',
      answer: 'For ready-made items, we can recommend local tailors in your area. For custom pieces, we provide one complimentary adjustment within 14 days. Additional alterations are available for a nominal fee.'
    },

    // Payment & Returns
    {
      id: 13,
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and Shop Pay. For large custom orders, we also offer payment plans and bank transfers.'
    },
    {
      id: 14,
      category: 'payment',
      question: 'What is your return policy?',
      answer: 'Ready-made items can be returned within 30 days for a full refund if unworn, unwashed, and with original tags. Custom items are final sale unless there\'s a production error on our part. We offer store credit for items outside the return window.'
    },
    {
      id: 15,
      category: 'payment',
      question: 'How do refunds work?',
      answer: 'Refunds are processed to your original payment method within 5-7 business days after we receive the returned items. For custom orders with production errors, refunds are issued immediately upon confirmation of the issue.'
    },
    {
      id: 16,
      category: 'payment',
      question: 'Do you offer price matching?',
      answer: 'We offer price matching on identical ready-made items from authorized retailers. Custom work is priced based on materials, complexity, and time investment, so price matching doesn\'t apply to customized pieces.'
    },

    // Care & Maintenance
    {
      id: 17,
      category: 'care',
      question: 'How should I care for my clothing?',
      answer: 'Care instructions are provided with each item and vary by fabric. Generally, we recommend cold water washing, air drying, and following the care label. For custom embroidered or printed items, turn inside out before washing to preserve the design.'
    },
    {
      id: 18,
      category: 'care',
      question: 'Will custom prints and embroidery fade over time?',
      answer: 'Our high-quality printing and embroidery techniques are designed to last. With proper care, custom designs should maintain their appearance for years. We use premium, colorfast materials and provide specific care instructions for each customization type.'
    },
    {
      id: 19,
      category: 'care',
      question: 'What if my item gets stained or damaged?',
      answer: 'We provide care tips for common stains and minor repairs. For significant damage within the first 6 months, contact us - we may offer repair services or replacement options depending on the issue and item type.'
    },
    {
      id: 20,
      category: 'care',
      question: 'Can I machine wash custom embroidered items?',
      answer: 'Yes, but we recommend using cold water, gentle cycle, and turning the garment inside out. Avoid bleach and fabric softeners. For delicate embroidery work, hand washing or professional cleaning may be recommended.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-white via-yellow-50 to-yellow-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Find answers about our ready-made and custom clothing, shipping, sizing, and more
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-yellow-600" />
            </div>
            <input
              type="text"
              placeholder="Search for answers..."
              className="block w-full pl-10 pr-4 py-3 border-2 border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white shadow-lg text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-yellow-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeCategory === category.id
                        ? 'bg-yellow-400 text-gray-900 shadow-md'
                        : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-700'
                    }`}
                  >
                    <category.icon className={`w-5 h-5 mr-3 ${category.color}`} />
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600">Try adjusting your search or browse different categories</p>
                </div>
              ) : (
                filteredFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl shadow-lg border-2 border-yellow-200 overflow-hidden transition-all duration-300 hover:shadow-xl"
                  >
                    <button
                      className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-inset"
                      onClick={() => toggleItem(faq.id)}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 pr-4">
                        {faq.question}
                      </h3>
                      <div className="flex-shrink-0">
                        {openItems.has(faq.id) ? (
                          <ChevronUp className="w-6 h-6 text-yellow-600" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-yellow-600" />
                        )}
                      </div>
                    </button>
                    
                    {openItems.has(faq.id) && (
                      <div className="px-6 pb-6">
                        <div className="border-t-2 border-yellow-100 pt-4">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-16 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-xl text-gray-800 mb-8">
            Our customer service team is here to help with any questions about ready-made or custom clothing
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl">
              Contact Support
            </button>
            <button className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-gray-200">
              Live Chat
            </button>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-gray-800">
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              <span>Response within 24 hours</span>
            </div>
            <div className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              <span>Custom design consultations available</span>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default FaqPage;