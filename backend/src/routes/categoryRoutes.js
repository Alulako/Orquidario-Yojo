import { Router } from "express";
import {
  listarCategorias,
  buscarPorSlug,
  criarCategoria,
  atualizarCategoria,
  removerCategoria,
} from "../controllers/categoryController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", listarCategorias);
router.get("/:slug", buscarPorSlug);

router.post("/", authMiddleware, criarCategoria);
router.put("/:id", authMiddleware, atualizarCategoria);
router.delete("/:id", authMiddleware, removerCategoria);

export default router;
