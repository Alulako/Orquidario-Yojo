import express from "express";
const router = express.Router();

import { calcularFrete, finalizarPedido } from "../controllers/cartController.js";

router.post("/frete", calcularFrete);
router.post("/finalizar", finalizarPedido);

export default router;