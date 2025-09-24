import Product from "../../models/productManagement/Product.js";

// Create Product
export const addProduct = async (req, res) => {
  try {
    const { name, category, price, description, stockQuantity } = req.body;

    if (!name || !category || !price || !stockQuantity || !size) {
      throw new Error("Name, category, price, and stockQuantity are required");
    }

    const imagePaths = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];

    const newProduct = new Product({
      name,
      category,
      price,
      description,
      size,
      stockQuantity,
      images: imagePaths,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error in addProduct:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get All Products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get Product by ID
export const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    return res.status(200).json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;

    // handle new uploaded images
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct)
      return res.status(404).json({ success: false, message: "Product not found" });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    console.error("Error updating product:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct)
      return res.status(404).json({ success: false, message: "Product not found" });

    return res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Add to Cart (reduce stock)
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.stockQuantity < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough stock available" });
    }

    product.stockQuantity -= quantity;
    await product.save();

    res.status(200).json({ success: true, message: "Added to cart", product });
  } catch (err) {
    console.error("Error in addToCart:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Remove from Cart (increase stock back)
export const removeFromCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Increase stock
    product.stockQuantity += quantity;
    await product.save();

    res.status(200).json({ success: true, message: "Removed from cart", product });
  } catch (err) {
    console.error("Error in removeFromCart:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
