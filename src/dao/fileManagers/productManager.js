import fs from 'fs/promises';
import path from 'path';
const baseDir = path.resolve();

class ProductManager {
  constructor() {
    this.dbPath = path.join(baseDir, 'src', 'dao', 'fileManagers', 'products.json');
  }

  async createProduct(product) {
    const { titulo, descripcion, precio, thumbnail, stock, codigo } = product;
    const productList = await this.getAllProducts();

    const newId =
      productList.length === 0
        ? 1
        : Number(productList[productList.length - 1].id) + 1;

    const newProduct = { id: newId.toString(), status: true, ...product };

    productList.push(newProduct);
    await fs.writeFile(this.dbPath, JSON.stringify(productList));
  }

  async getAllProducts() {
    const productData = await fs.readFile(this.dbPath, 'utf-8');
    const parsedProducts = JSON.parse(productData);
    if (Array.isArray(parsedProducts)) {
      return parsedProducts;
    } else {
      throw new Error('Invalid product data structure');
    }
  }

  async getProductById(productId) {
    const productList = await this.getAllProducts();
    const foundProduct = productList.find(p => productId === p.id);
    if (foundProduct) {
      return foundProduct;
    } else {
      throw new Error('Product not found');
    }
  }

  async updateProduct(productId, updatedProduct) {
    try {
      const updatedList = [];
      const currentProducts = await this.getAllProducts();
      currentProducts.forEach(product => {
        updatedList.push(product.id !== productId ? product : updatedProduct);
      });
      await fs.writeFile(this.dbPath, JSON.stringify(updatedList));
    } catch (err) {
      console.error(err);
    }
  }

  async deleteProduct(productId) {
    try {
      const currentProducts = await this.getAllProducts();
      const filteredProducts = currentProducts.filter(product => product.id !== productId);
      await fs.writeFile(this.dbPath, JSON.stringify(filteredProducts));
    } catch (err) {
      console.error(err);
    }
  }
}

export default ProductManager;
