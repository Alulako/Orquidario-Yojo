import { Router } from "express";
import { googleConfig, googleLogin, login, me } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/google/config", googleConfig);
router.post("/google", googleLogin);
router.post("/login", login);
router.get("/me", authMiddleware, me);

export default router;
