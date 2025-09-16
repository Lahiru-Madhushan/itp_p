// controllers/ProductManagement/ProductController.js

import Product from "../../models/productManagement/Product.js";

// Create Product
export const addProduct = async (req, res) => {
  try {
    const { name, category, price, description, images, stockQuantity } = req.body;

    if (!name || !category || !price || !stockQuantity) {
  throw new Error("Name, category, price, and stockQuantity are required");
}


    const newProduct = new Product({
      name,
      category,
      price,
      description,
      images,
      stockQuantity,
      
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

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

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

    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) return res.status(404).json({ success: false, message: "Product not found" });

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

    if (!deletedProduct) return res.status(404).json({ success: false, message: "Product not found" });

    return res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
