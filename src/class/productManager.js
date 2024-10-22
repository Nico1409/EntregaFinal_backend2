import fs from "node:fs";

class productManager {
  constructor(path) {
    this.path = path;
    this.productList = [];
  }

  generateUniqueId() {
    if (this.productList.length === 0) {
      return 1;
    }
    const lastProductId = this.productList[this.productList.length - 1].id;

    return lastProductId + 1;
  }

  getIndexById(pid) {
    return this.productList.findIndex((item) => item.id == pid);
  }

  async saveData() {
    await fs.promises.writeFile(
      this.path,
      JSON.stringify({ products: [...this.productList] })
    );
  }

  async getProductList() {
    try {
      await fs.promises.access(this.path);
    } catch (error) {
      const initialContent = { products: [] };
      await fs.promises.writeFile(this.path, JSON.stringify(initialContent));
    }

    const list = await fs.promises.readFile(this.path, "utf-8");
    this.productList = [...JSON.parse(list).products];
    return [...this.productList];
  }

  async addProduct(product) {
    await this.getProductList();

    product.id = this.generateUniqueId();

    this.productList.push(product);

    await this.saveData();
    return this.productList[product];
  }

  async deleteProduct(pid) {
    await this.getProductList();
    let indexToDelete = this.getIndexById(pid);
    if (indexToDelete == -1) return false;
    else {
      this.productList.splice(indexToDelete, 1);
      await this.saveData();
      return true;
    }
  }

  async changeProduct(pid, productChanged) {
    await this.getProductList();
    let indexToChange = this.getIndexById(pid);

    if (indexToChange == -1) return;
    else {
      Object.assign(this.productList[indexToChange], productChanged);
        if(!productChanged.thumbnails) delete this.productList[indexToChange].thumbnails
      await this.saveData();
      return this.productList[indexToChange];
    }
  }
}

export default productManager;
