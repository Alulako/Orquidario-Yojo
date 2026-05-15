import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/auth.js";

export async function login(req, res, next) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: "Email e senha sao obrigatorios" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Credenciais invalidas" });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ message: "Credenciais invalidas" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    return res.json({
      user: {
        id: req.user.id,
        nome: req.user.nome,
        email: req.user.email,
      },
    });
  } catch (err) {
    next(err);
  }
}
