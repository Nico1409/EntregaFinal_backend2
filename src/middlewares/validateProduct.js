const validateProduct = (req, res, next) => {
  let { title, description, code, price, status, stock, category } = req.body;


  const validProduct = {
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
  };

  req.body = validProduct;


  if (!status) {
    req.body.status = true;
  }

  if (!title || !description || !code || !price || !stock || !category) {
    return res
      .status(400)
      .json({ error: "Los campos del producto son inválidos" });
  }

  next();
};

export default validateProduct;
