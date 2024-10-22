import {ProductModel} from "../models/product.model.js";

class ProductDAO {
  async getProductById(productId) {
    return await ProductModel.findById(productId);
  }

  async createProduct(productData) {
    return await ProductModel.create(productData);
  }

  async updateProduct(productId, updateData) {
    return await ProductModel.findByIdAndUpdate(productId, updateData, { new: true });
  }

  async deleteProduct(productId) {
    return await ProductModel.findByIdAndDelete(productId);
  }

  async updateStock(productId, quantity) {
    return await ProductModel.findByIdAndUpdate(productId, { $inc: { stock: -quantity } });
  }
}

export default new ProductDAO();
