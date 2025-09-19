import React, { useState } from 'react';
import { 
  Heart, 
  Users, 
  Award, 
  Scissors, 
  Palette, 
  Globe, 
  Leaf, 
  Clock, 
  Target, 
  Star,
  ChevronRight,
  Play
} from 'lucide-react';
import Footer from "./Footer";

const AboutUsPage = () => {
  const [activeTab, setActiveTab] = useState('story');

  const stats = [
    { number: '50K+', label: 'Happy Customers', icon: Users },
    { number: '10K+', label: 'Custom Pieces Created', icon: Scissors },
    { number: '5+', label: 'Years of Excellence', icon: Award },
    { number: '98%', label: 'Customer Satisfaction', icon: Star }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Quality Craftsmanship',
      description: 'Every piece is crafted with attention to detail, using premium materials and time-honored techniques to ensure lasting quality.'
    },
    {
      icon: Palette,
      title: 'Creative Expression',
      description: 'We believe fashion is personal expression. Our custom services help you bring your unique vision to life with unlimited possibilities.'
    },
    {
      icon: Leaf,
      title: 'Sustainable Fashion',
      description: 'Committed to ethical practices, we use eco-friendly materials and sustainable production methods to protect our planet.'
    },
    {
      icon: Globe,
      title: 'Global Community',
      description: 'Serving customers worldwide, we celebrate diversity and create fashion that transcends borders and brings people together.'
    }
  ];

  const team = [
    {
      name: 'Sarah Chen',
      role: 'Founder & Creative Director',
      bio: 'With 15 years in fashion design, Sarah founded our store to make high-quality, personalized clothing accessible to everyone.',
      image: '👩‍🎨'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Head of Customization',
      bio: 'Marcus leads our custom design team, bringing innovative techniques and artistic vision to every personalized piece.',
      image: '👨‍🎨'
    },
    {
      name: 'Emily Watson',
      role: 'Quality Assurance Manager',
      bio: 'Emily ensures every garment meets our high standards before reaching customers, maintaining excellence in every stitch.',
      image: '👩‍💼'
    },
    {
      name: 'David Kim',
      role: 'Sustainability Coordinator',
      bio: 'David spearheads our eco-friendly initiatives, sourcing sustainable materials and implementing green production practices.',
      image: '👨‍🔬'
    }
  ];

  const timeline = [
    {
      year: '2019',
      title: 'The Beginning',
      description: 'Started as a small online boutique with a vision to make quality fashion accessible to everyone.'
    },
    {
      year: '2020',
      title: 'Custom Revolution',
      description: 'Launched our custom clothing service, allowing customers to design their perfect pieces.'
    },
    {
      year: '2021',
      title: 'Going Green',
      description: 'Implemented sustainable practices and eco-friendly materials across our entire production line.'
    },
    {
      year: '2022',
      title: 'Global Expansion',
      description: 'Extended our reach worldwide, serving customers across 30+ countries with fast, reliable shipping.'
    },
    {
      year: '2023',
      title: 'Innovation Hub',
      description: 'Opened our state-of-the-art design studio with the latest technology for custom creations.'
    },
    {
      year: '2024',
      title: 'Community Impact',
      description: 'Reached 50,000+ satisfied customers and launched our giving-back initiative to support local communities.'
    }
  ];

  const tabContent = {
    story: {
      title: 'Our Story',
      content: (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Where It All Started</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Our journey began in 2019 with a simple belief: everyone deserves to wear clothing that makes them feel confident and unique. What started as a small online boutique has grown into a global fashion destination, serving customers who value both quality ready-made pieces and the magic of custom creation.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We noticed a gap in the market - while fast fashion dominated with poor quality, and haute couture remained exclusive and expensive, there was little in between. We set out to bridge that gap, offering premium quality at accessible prices, with the option to customize any piece to your exact preferences.
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-8 text-center">
              <div className="w-24 h-24 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Heart className="w-12 h-12 text-gray-900" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Our Mission</h4>
              <p className="text-gray-800">To democratize fashion by making high-quality, personalized clothing accessible to everyone, everywhere.</p>
            </div>
          </div>
        </div>
      )
    },
    vision: {
      title: 'Our Vision',
      content: (
        <div className="space-y-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Building the Future of Fashion</h3>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              We envision a world where fashion is personal, sustainable, and accessible - where every individual can express their unique style without compromising on quality or ethics.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-200 text-center">
              <Target className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Personalization First</h4>
              <p className="text-gray-700">Every customer should have access to clothing that fits their body, style, and personality perfectly.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-200 text-center">
              <Leaf className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Sustainable Future</h4>
              <p className="text-gray-700">Leading the industry toward sustainable practices that protect our planet for future generations.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-200 text-center">
              <Globe className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Global Community</h4>
              <p className="text-gray-700">Connecting fashion lovers worldwide and celebrating the diversity of style and culture.</p>
            </div>
          </div>
        </div>
      )
    },
    journey: {
      title: 'Our Journey',
      content: (
        <div className="space-y-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Milestones That Matter</h3>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              From humble beginnings to global impact, every step of our journey has been driven by our commitment to quality, innovation, and customer satisfaction.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-0.5 w-0.5 h-full bg-yellow-400"></div>
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-200 ml-12 md:ml-0">
                      <div className="flex items-center mb-2">
                        <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                          {item.year}
                        </span>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-700">{item.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-2 md:left-1/2 md:transform md:-translate-x-1/2 w-4 h-4 bg-yellow-400 rounded-full border-4 border-white shadow-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-white via-yellow-50 to-yellow-100 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              About <span className="text-yellow-600">Our Story</span>
            </h1>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              We're passionate about creating exceptional clothing that celebrates individuality. 
              From ready-made favorites to completely custom creations, we bring your style vision to life.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <stat.icon className="w-8 h-8 text-gray-900" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-700 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b-2 border-yellow-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-8">
            {Object.keys(tabContent).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 font-semibold text-lg transition-all duration-300 border-b-4 ${
                  activeTab === tab
                    ? 'text-yellow-600 border-yellow-400'
                    : 'text-gray-600 border-transparent hover:text-yellow-600 hover:border-yellow-200'
                }`}
              >
                {tabContent[tab].title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {tabContent[activeTab].content}
      </div>

      {/* Values Section */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-800 max-w-3xl mx-auto">
              These principles guide everything we do, from design and production to customer service and community impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-700 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              The creative minds and passionate professionals behind every beautiful piece we create.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl p-6 shadow-lg border-2 border-yellow-200 text-center hover:shadow-xl transition-all duration-300">
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-yellow-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-700 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Whether you're looking for ready-made pieces or want to design something completely unique, 
            we're here to bring your fashion vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-yellow-500 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center">
              Shop Ready-Made
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
            <button className="bg-transparent border-2 border-yellow-400 text-yellow-400 px-8 py-4 rounded-xl font-semibold hover:bg-yellow-400 hover:text-gray-900 transition-all duration-300 flex items-center justify-center">
              Start Custom Design
              <Palette className="w-5 h-5 ml-2" />
            </button>
          </div>
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-300">
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-yellow-400" />
              <span>Free design consultations</span>
            </div>
            <div className="flex items-center">
              <Globe className="w-5 h-5 mr-2 text-yellow-400" />
              <span>Worldwide shipping available</span>
            </div>
            <div className="flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-400" />
              <span>Quality guarantee on every piece</span>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default AboutUsPage;