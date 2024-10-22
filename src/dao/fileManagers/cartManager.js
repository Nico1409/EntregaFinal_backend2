import fs from 'fs/promises';
import path from 'path';
import ProductManager from './productManager.js';

const basePath = path.resolve();

class CartManager {
  constructor() {
    this.cartFile = path.join(basePath, 'src', 'dao', 'fileManagers', 'carts.json');
    this.productService = new ProductManager();
  }

  async addProductToCart(cartId, productId) {
    try {
      const cart = await this.fetchCart(cartId);
      const product = await this.productService.getProductById(productId);

      if (!product.status) {
        throw new Error('No stock available for this product');
      }

      const existingProduct = cart.products.find(p => p.product === productId);
      if (existingProduct) {
        existingProduct.quantity++;
      } else {
        cart.products.push({ product: productId, quantity: 1 });
      }

      await this.saveCart(cart);

      return `Product with ID ${productId} added to cart with ID ${cartId}`;
    } catch (err) {
      throw new Error(err);
    }
  }

  async fetchCart(cartId) {
    try {
      const carts = await this.getCartsFromFile();
      const cart = carts.find(c => c.id === cartId);

      if (!cart) {
        throw new Error(`Cart with ID ${cartId} not found`);
      }

      return cart;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getCartsFromFile() {
    try {
      const data = await fs.readFile(this.cartFile, 'utf-8');
      return JSON.parse(data).carts;
    } catch (err) {
      console.error('File read error:', err);
      throw err;
    }
  }

  async saveCart(cart) {
    try {
      const carts = await this.getCartsFromFile();
      const cartIndex = carts.findIndex(c => c.id === cart.id);

      if (cartIndex !== -1) {
        carts[cartIndex] = cart;
        await this.saveCartsToFile(carts);
      } else {
        throw new Error(`Cart with ID ${cart.id} not found`);
      }
    } catch (err) {
      console.error('Error saving cart:', err);
      throw err;
    }
  }

  async saveCartsToFile(carts) {
    try {
      await fs.writeFile(this.cartFile, JSON.stringify({ carts }, null, 2), 'utf-8');
    } catch (err) {
      console.error('File write error:', err);
      throw err;
    }
  }
}

export default CartManager;
