const validateCart = (req, res, next) => {
  const { products } = req.body;

  if (!Array.isArray(products)) {
    return res.status(400).json({ error: "'products' debe ser un array" });
  }

  for (let i = 0; i < products.length; i++) {
    const item = products[i];


    if (typeof item !== 'object' || typeof item.product !== 'number' || typeof item.qty !== 'number') {
      return res.status(400).json({ error: "Cada objeto debe tener propiedades 'product' (número) y 'qty' (número)" });
    }


    products[i] = {
      product: item.product,
      qty: item.qty
    };
  }


  req.body = { products };

  next();
};

export default validateCart;
