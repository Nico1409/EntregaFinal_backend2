import express from "express";
import ProductManager from "./class/productManager.js";

import { __dirname } from "./utils.js";
import { Server } from "socket.io";
import { AppInit } from "./init/initialConfig.js";

const app = express();

AppInit(app);

const productManager = new ProductManager(__dirname + "/data/product.json");

const httpServer = app.listen(process.env.PORT, () => {
  console.log("Conectado");
});

const socketServer = new Server(httpServer);

socketServer.on("connection", async (socket) => {
  async function updateProducts() {
    try {
      const productsList = await productManager.getProductList();
      socket.emit("updateProducts", productsList);
    } catch (err) {
      throw new Error(err);
    }
  }
  updateProducts();

  socket.on("addProduct", async (Product) => {
    try {
      await productManager.addProduct(Product);
      updateProducts();
    } catch (err) {
      throw new Error(err);
    }
  });

  socket.on("deleteProduct", async (ProductId) => {
    try {
      await productManager.deleteProduct(ProductId);
      updateProducts();
    } catch (err) {
      throw new Error(err);
    }
  });
});
