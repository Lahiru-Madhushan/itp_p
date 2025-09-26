import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Package,
  Heart,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid,
  List,
  Search,
  Truck,
  Shield,
  RotateCcw,
  X,
} from "lucide-react";
import Footer from "../Footer";

export default function FemaleWarePage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [imageIndexes, setImageIndexes] = useState({});
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Fetch FemaleWare products
  useEffect(() => {
    fetch("http://localhost:8070/product/allProducts")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((p) => p.category === "FemaleWare");
        setProducts(filtered);
        setFilteredProducts(filtered);

        if (filtered.length > 0) {
          const prices = filtered.map((p) => p.price);
          setPriceRange({
            min: Math.min(...prices),
            max: Math.max(...prices),
          });
        }
      })
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...products];

    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterBy === "inStock") {
      result = result.filter((p) => p.stockQuantity > 0);
    } else if (filterBy === "lowStock") {
      result = result.filter(
        (p) => p.stockQuantity > 0 && p.stockQuantity <= 5
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "priceLow":
          return a.price - b.price;
        case "priceHigh":
          return b.price - a.price;
        case "stock":
          return b.stockQuantity - a.stockQuantity;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(result);
  }, [products, searchTerm, filterBy, sortBy]);

  // Auto image slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndexes((prev) => {
        const updated = { ...prev };
        products.forEach((p) => {
          if (p.images?.length > 1) {
            updated[p._id] = ((prev[p._id] || 0) + 1) % p.images.length;
          }
        });
        return updated;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [products]);

  // Toggle favorites
  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const newFav = new Set(prev);
      if (newFav.has(id)) newFav.delete(id);
      else newFav.add(id);
      return newFav;
    });
  };

  // Modal carousel
  const handleModalPrev = () => {
    if (!selectedProduct) return;
    setModalImageIndex((prev) =>
      prev > 0 ? prev - 1 : selectedProduct.images.length - 1
    );
  };
  const handleModalNext = () => {
    if (!selectedProduct) return;
    setModalImageIndex((prev) =>
      prev < selectedProduct.images.length - 1 ? prev + 1 : 0
    );
  };

  // Add to cart
  const handleAddToCart = async (id, size = "M") => {
    try {
      const res = await fetch("http://localhost:8070/product/addToCart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, quantity }),
      });

      const result = await res.json();
      if (!result.success) {
        alert(result.message || "Error adding to cart");
        return;
      }

      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingItem = savedCart.find(
        (item) => item._id === result.product._id && item.size === size
      );

      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + quantity;
      } else {
        savedCart.push({ ...result.product, quantity, size });
      }

      localStorage.setItem("cart", JSON.stringify(savedCart));
      alert(`✓ Added ${quantity} item(s) to cart (Size: ${size})!`);
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Cart error:", err);
      alert("Error adding to cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-medium">
            Loading FemaleWare Collection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Women's Collection
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our curated range of women's fashion with elegance and
            comfort in every piece
          </p>
        </div>

        {/* Controls */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Filters + View */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
              >
                <option value="name">Sort by Name</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="stock">Stock Level</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {filteredProducts.length} products
              </span>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid"
                    ? "bg-pink-400 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list"
                    ? "bg-pink-400 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Status
                  </label>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
                  >
                    <option value="all">All Products</option>
                    <option value="inStock">In Stock</option>
                    <option value="lowStock">Low Stock</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range: Rs. {priceRange.min.toLocaleString()} - Rs.{" "}
                    {priceRange.max.toLocaleString()}
                  </label>
                  <div className="text-sm text-gray-500">
                    Price filtering coming soon
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-24 h-24 text-pink-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              {searchTerm
                ? "No products match your search"
                : "No Products Found"}
            </h2>
            <p className="text-gray-500">
              {searchTerm
                ? "Try different search terms"
                : "Check back soon for our latest collection!"}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-6"
            }
          >
            {filteredProducts.map((product) => {
              const currentIndex = imageIndexes[product._id] || 0;
              return (
                <div
                  key={product._id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setModalImageIndex(0);
                    setQuantity(1);
                  }}
                  className="cursor-pointer group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100 hover:border-pink-300"
                >
                  <div className="relative bg-gray-50 h-64 flex items-center justify-center">
                    {product.images?.length > 0 ? (
                      <img
                        src={`http://localhost:8070${product.images[currentIndex]}`}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 bg-gray-100">
                        <Package className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-2">
                    <h2 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-pink-600 transition-colors">
                      {product.name}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-black">
                        Rs. {product.price?.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {product.stockQuantity} left
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Trust Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Truck className="w-12 h-12 text-pink-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Free Shipping
              </h3>
              <p className="text-gray-600">
                Free delivery on orders over Rs. 5,000
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="w-12 h-12 text-pink-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure Payment
              </h3>
              <p className="text-gray-600">
                Your payment information is safe with us
              </p>
            </div>
            <div className="flex flex-col items-center">
              <RotateCcw className="w-12 h-12 text-pink-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Easy Returns
              </h3>
              <p className="text-gray-600">30-day hassle-free return policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image carousel */}
              <div className="relative bg-gray-50 h-96 rounded-xl overflow-hidden flex flex-col items-center justify-center">
                {selectedProduct.images?.length > 0 ? (
                  <>
                    <img
                      src={`http://localhost:8070${selectedProduct.images[modalImageIndex]}`}
                      alt={selectedProduct.name}
                      className="w-full h-full object-contain rounded-lg"
                    />
                    {/* Thumbnails */}
                    <div className="flex gap-2 mt-3 overflow-x-auto">
                      {selectedProduct.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={`http://localhost:8070${img}`}
                          alt="thumb"
                          onClick={() => setModalImageIndex(idx)}
                          className={`h-16 w-16 object-contain rounded-lg border cursor-pointer ${
                            modalImageIndex === idx
                              ? "border-pink-500"
                              : "border-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <Package className="w-16 h-16 text-gray-400" />
                )}

                {selectedProduct.images?.length > 1 && (
                  <>
                    <button
                      onClick={handleModalPrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <button
                      onClick={handleModalNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-700" />
                    </button>
                  </>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">
                  {selectedProduct.name}
                </h2>
                <p className="text-gray-600">{selectedProduct.description}</p>
                <div className="text-2xl font-bold text-pink-600">
                  Rs. {selectedProduct.price?.toLocaleString()}
                </div>
                <p className="text-sm text-gray-700">
                  Stock: {selectedProduct.stockQuantity} | Size:{" "}
                  {selectedProduct.size || "M"}
                </p>

                {/* Quantity Selector */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Quantity:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.stockQuantity}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Number(e.target.value)))
                    }
                    className="w-20 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 outline-none"
                  />
                </div>

                <button
                  onClick={() => handleAddToCart(selectedProduct._id)}
                  disabled={selectedProduct.stockQuantity <= 0}
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    selectedProduct.stockQuantity > 0
                      ? "bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {selectedProduct.stockQuantity > 0
                    ? `Add ${quantity} to Cart`
                    : "Out of Stock"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
