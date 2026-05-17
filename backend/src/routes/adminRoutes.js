import { Router } from "express";
import { resumo } from "../controllers/dashboardController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/resumo", authMiddleware, resumo);

export default router;
