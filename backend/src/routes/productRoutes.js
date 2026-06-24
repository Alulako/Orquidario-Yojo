import { Router } from "express";
import {
  listarProdutos,
  listarDestaques,
  buscarPorId,
  buscarPorSlug,
  criarProduto,
  atualizarProduto,
  removerProduto,
} from "../controllers/productController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = Router();

router.get("/", listarProdutos);
router.get("/destaques", listarDestaques);
router.get("/id/:id", buscarPorId);
router.get("/:slug", buscarPorSlug);

router.post("/", authMiddleware, upload.single("imagem"), criarProduto);
router.put("/:id", authMiddleware, upload.single("imagem"), atualizarProduto);
router.delete("/:id", authMiddleware, removerProduto);

export default router;
