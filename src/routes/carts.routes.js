import { Router } from "express";
import { __dirname } from "../utils.js";
import { CartModel } from "../dao/models/cart.model.js";
import CartRepository from "../repositories/cart.repository.js";
import ProductRepository from "../repositories/product.repository.js";
import TicketRepository from "../repositories/ticket.repository.js";
import { authenticateJWT, userOnly } from "../middlewares/auth.middleware.js";
import transport from "../config/servicesEmail.js";

const router = Router();

router.post("/", async (req, res) => {
  const newCart = req.body;

  try {
    let cart = await CartModel.create(newCart);

    cart = await cart.populate("products.product");

    res.status(201).json({ payload: cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al crear el carrito" });
  }
});

router.get("/:cid", async (req, res) => {
  const { cid } = req.params;

  try {
    const cart = await CartModel.findById(cid).populate("products.product");

    if (!cart) {
      return res.status(404).json({ error: "No existe un carrito con ese id" });
    }

    res.status(200).json({ payload: cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
});

router.post(
  "/:cid/product/:pid",
  authenticateJWT,
  userOnly,
  async (req, res) => {
    const { cid, pid } = req.params;

    try {
      const cart = await CartModel.findById(cid);

      if (!cart) {
        return res
          .status(404)
          .json({ error: "No existe un carrito con ese id" });
      }

      const productInCart = cart.products.find(
        (item) => item.product.toString() === pid
      );

      if (productInCart) {
        productInCart.quantity += 1;
      } else {
        cart.products.push({ product: pid, quantity: 1 });
      }

      await cart.save();
      await cart.populate("products.product");

      res.status(201).json({ payload: cart });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error al añadir el producto al carrito" });
    }
  }
);

router.delete("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const cart = await CartModel.findById(cid);

    if (!cart) {
      return res.status(404).json({ error: "No existe un carrito con ese id" });
    }

    cart.products = cart.products.filter(
      (item) => item.product.toString() !== pid
    );

    await cart.save();

    res.status(200).json({ message: "Producto eliminado del carrito" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Error al eliminar el producto del carrito" });
  }
});

router.delete("/:cid", async (req, res) => {
  const { cid } = req.params;

  try {
    const cart = await CartModel.findByIdAndUpdate(
      cid,
      { products: [] },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ error: "No existe un carrito con ese id" });
    }

    res
      .status(200)
      .json({ message: "Todos los productos fueron eliminados del carrito" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Error al eliminar los productos del carrito" });
  }
});

router.put("/:cid", async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body;

  try {
    const cart = await CartModel.findByIdAndUpdate(
      cid,
      { products },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ error: "No existe un carrito con ese id" });
    }

    res.status(200).json({ payload: cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar el carrito" });
  }
});

router.get("/", async (req, res) => {
  try {
    // Busca el primer carrito en la colección
    const cart = await CartModel.findOne().populate("products.product");

    if (!cart) {
      return res.status(404).json({ error: "No hay carritos disponibles" });
    }

    res.status(200).json({ payload: cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener el primer carrito" });
  }
});

router.post("/:cid/purchase", authenticateJWT, userOnly, async (req, res) => {
  try {
    const cart = await CartRepository.getCartById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado." });
    }

    const outOfStockProducts = [];
    let totalCost = 0;

    for (const item of cart.products) {
      const product = await ProductRepository.getProductById(item.product._id);

      if (product.stock >= item.quantity) {
        await ProductRepository.updateStock(product._id, item.quantity);
        totalCost += product.price * item.quantity;
      } else if (product.stock > 0) {
        totalCost += product.price * product.stock;
        await ProductRepository.updateStock(product._id, product.stock);

        outOfStockProducts.push({
          product: product._id,
          unavailableQuantity: item.quantity - product.stock,
        });

        item.quantity -= product.stock;
      } else {
        outOfStockProducts.push({
          product: product._id,
          unavailableQuantity: item.quantity,
        });
      }
    }

    if (totalCost > 0) {
      const ticketInfo = {
        amount: totalCost,
        purchaser: req.user.email,
      };
      const ticket = await TicketRepository.createTicket(ticketInfo);
      await transport.sendMail({
        from: "CoderMail <nicolas140902@gmail.com>",
        to: "nicolas140902@gmail.com",
        subject: "Prueba mail",
        html: `
          <div>
              <p> La compra se realizo con exito</p>
           </div>
          <div>
              <p> Codigo de compra: ${ticket.code} </p>
          </div>
      `,
        attachments: [],
      });
    }

    cart.products = cart.products.filter((item) => item.quantity > 0);
    await CartRepository.updateCart(req.params.cid, {
      products: cart.products,
    });

    let responseMessage = "Compra realizada con éxito";
    if (outOfStockProducts.length > 0) {
      responseMessage =
        totalCost > 0
          ? "La compra se realizó parcialmente debido a productos sin stock"
          : "No hay productos disponibles para completar la compra";
    }

    res.json({
      message: responseMessage,
      unavailableProducts: outOfStockProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
