import { Router } from "express";
import CartsRoute from "./carts.routes.js";
import HomeRoute from "./home.routes.js";
import ProductsRoute from "./products.routes.js";
import RealTimeProductsRoute from "./realTimeProducts.routes.js";
import SessionRoute from "./session.routes.js";

const app = Router()

app.use("/api/products", ProductsRoute);
app.use("/api/carts", CartsRoute);
app.use("/realtimeproducts", RealTimeProductsRoute);
app.use("/", HomeRoute);
app.use("/api/sessions", SessionRoute);

export default app
