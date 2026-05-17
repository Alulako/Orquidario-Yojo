import { Router } from "express";
import authRoutes from "./authRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import productRoutes from "./productRoutes.js";
import adminRoutes from "./adminRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categorias", categoryRoutes);
router.use("/produtos", productRoutes);
router.use("/admin", adminRoutes);

export default router;
