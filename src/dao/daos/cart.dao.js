import {CartModel} from "../models/cart.model.js";

class CartDAO {
  async getCartById(cartId) {
    return await CartModel.findById(cartId).populate("products.product");
  }

  async createCart(cartData) {
    return await CartModel.create(cartData);
  }

  async updateCart(cartId, updateData) {
    return await CartModel.findByIdAndUpdate(cartId, updateData, { new: true });
  }

  async deleteCart(cartId) {
    return await CartModel.findByIdAndDelete(cartId);
  }
}

export default new CartDAO();
