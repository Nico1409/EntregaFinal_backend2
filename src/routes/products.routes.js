import { Router } from "express";
import { uploader } from "../utils.js";
import { __dirname } from "../utils.js";
import validateProduct from "../middlewares/validateProduct.js";
import { ProductModel } from "../dao/models/product.model.js";
import { authenticateJWT, userOnly, adminOnly } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/",authenticateJWT,adminOnly, uploader.single("thumbnails"), validateProduct, async (req, res) => {
  const newProduct = req.body;

  if (req.file) newProduct.thumbnails = req.file.path;

  const result = await ProductModel.create({
    ...newProduct,
    thumbnail: newProduct.thumbnails?.split('public')[1],
  });

  res.status(201).json({ payload: result });
});

router.get("/", async (req, res) => {
  const { limit = 10, page = 1, sort = '', ...query } = req.query;
  const sortManager = {
    'asc': 1,
    'desc': -1
  }

  const products = await ProductModel.paginate(
    { ...query },
    { 
      limit,
      page,
      ...(sort && { sort: { price: sortManager[sort]} }),
      customLabels: { docs: 'payload' }
    })
  const baseUrl = `${req.protocol}://${req.get('host')}${req.originalUrl.split('?').shift()}`;
  const prevLink = products.hasPrevPage ? `${baseUrl}?page=${products.prevPage}&limit=${limit}` : null;
  const nextLink = products.hasNextPage ? `${baseUrl}?page=${products.nextPage}&limit=${limit}` : null;

  res.status(200).json({
    ...products,
    status: 'success',
    prevLink,
    nextLink
  });
});

router.get("/:pid", async (req, res) => {
  const { pid } = req.params;

  try {
    const product = await ProductModel.findById(pid);

    if (!product) {
      return res.status(404).json({ error: 'No existe un producto con ese id' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

router.delete("/:pid", authenticateJWT,adminOnly, async (req, res) => {
  const { pid } = req.params;

  try {
    const result = await ProductModel.findByIdAndDelete(pid);

    if (!result) {
      return res.status(404).json({ error: 'No existe un producto con ese id' });
    }

    res.status(200).json({ message: "Producto borrado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: 'Error al borrar el producto' });
  }
});


router.put("/:pid",authenticateJWT,adminOnly, uploader.single("thumbnails"), validateProduct, async (req, res) => {
  const { pid } = req.params;
  const productChanged = req.body;

  if (req.file) productChanged.thumbnails = req.file.path;

  try {
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      pid, 
      {
        ...productChanged,
        thumbnail: productChanged.thumbnails?.split('public')[1],
      }, 
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'No existe un producto con ese id' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});


export default router;