import express from "express";
const router = express.Router();

import authRoutes from "./authRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import productRoutes from "./productRoutes.js";
import adminRoutes from "./adminRoutes.js";
import cartRoutes from "./cartRoutes.js";

router.use("/auth", authRoutes);
router.use("/categorias", categoryRoutes);
router.use("/produtos", productRoutes);
router.use("/admin", adminRoutes);
router.use("/carrinho", cartRoutes);

export default router;