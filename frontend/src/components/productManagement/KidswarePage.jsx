import React, { useEffect, useState } from "react";
import { ShoppingCart, Package, Heart, ChevronLeft, ChevronRight } from "lucide-react";

export default function KidswarePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [imageIndexes, setImageIndexes] = useState({}); // track current image per product

  // ✅ Fetch only Kidsware products
  useEffect(() => {
    fetch("http://localhost:8070/product/allProducts")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((p) => p.category === "Kidsware");
        setProducts(filtered);
      })
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Toggle favorites
  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const newFav = new Set(prev);
      if (newFav.has(id)) newFav.delete(id);
      else newFav.add(id);
      return newFav;
    });
  };

  // ✅ Carousel navigation
  const handlePrevImage = (id, total) => {
    setImageIndexes((prev) => ({
      ...prev,
      [id]: prev[id] > 0 ? prev[id] - 1 : total - 1,
    }));
  };

  const handleNextImage = (id, total) => {
    setImageIndexes((prev) => ({
      ...prev,
      [id]: prev[id] < total - 1 ? prev[id] + 1 : 0,
    }));
  };

  // ✅ Add to Cart (always default size "M")
  const handleAddToCart = async (id) => {
    const size = "M"; // 👈 fixed size
    try {
      const res = await fetch("http://localhost:8070/product/addToCart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, quantity: 1 }),
      });

      const result = await res.json();
      if (!result.success) {
        alert(result.message || "Error adding to cart");
        return;
      }

      // ✅ Update stock in UI
      setProducts((prev) =>
        prev.map((p) => (p._id === result.product._id ? result.product : p))
      );

      // ✅ Save to localStorage
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingItem = savedCart.find(
        (item) => item._id === result.product._id && item.size === size
      );

      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
      } else {
        savedCart.push({ ...result.product, quantity: 1, size });
      }

      localStorage.setItem("cart", JSON.stringify(savedCart));
      alert(`Added to cart (Size: ${size})!`);
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
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-medium">Loading Kidsware...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-yellow-50 to-white">
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              No Kidsware Found
            </h2>
            <p className="text-gray-500">
              Check back soon for our latest kids collection!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => {
              const currentIndex = imageIndexes[product._id] || 0;
              return (
                <div
                  key={product._id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border-2 border-transparent hover:border-yellow-300"
                >
                  {/* Carousel */}
                  <div className="relative bg-gray-50 h-64">
                    {product.images?.length > 0 ? (
                      <img
                        src={`http://localhost:8070${product.images[currentIndex]}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 bg-gray-100">
                        <Package className="w-16 h-16" />
                      </div>
                    )}

                    {/* Arrows */}
                    {product.images?.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            handlePrevImage(product._id, product.images.length)
                          }
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                          onClick={() =>
                            handleNextImage(product._id, product.images.length)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                      </>
                    )}

                    {/* Stock indicator */}
                    {product.stockQuantity <= 0 && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Sold Out
                      </div>
                    )}
                    {product.stockQuantity > 0 &&
                      product.stockQuantity <= 5 && (
                        <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-medium">
                          Low Stock
                        </div>
                      )}

                    {/* Favorite button */}
                    <button
                      onClick={() => toggleFavorite(product._id)}
                      className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 ${
                        favorites.has(product._id)
                          ? "bg-red-500 text-white"
                          : "bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-500"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.has(product._id) ? "fill-current" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-6 space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                      {product.name}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-bold text-black">
                        Rs. {product.price?.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {product.stockQuantity} left
                      </div>
                    </div>

                    {/* ✅ Just show fixed size */}
                    <p className="text-sm text-gray-700 mt-1">Size: M</p>

                    <button
                      onClick={() => handleAddToCart(product._id)}
                      disabled={product.stockQuantity <= 0}
                      className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                        product.stockQuantity > 0
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {product.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
