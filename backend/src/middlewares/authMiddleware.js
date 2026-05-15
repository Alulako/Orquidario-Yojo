import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/auth.js";
import User from "../models/User.js";

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token nao fornecido" });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Formato de token invalido" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Usuario nao encontrado" });
    }

    req.user = {
      id: user.id,
      nome: user.nome,
      email: user.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalido ou expirado" });
  }
}

export default authMiddleware;
