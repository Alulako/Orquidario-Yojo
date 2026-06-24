import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/auth.js";

function gerarToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function serializarUser(user) {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
  };
}

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

    return res.json({
      user: serializarUser(user),
      token: gerarToken(user),
    });
  } catch (err) {
    next(err);
  }
}

export async function googleConfig(req, res, next) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      return res.status(500).json({ message: "GOOGLE_CLIENT_ID nao configurado no backend/.env" });
    }

    return res.json({ clientId });
  } catch (err) {
    next(err);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const { credential } = req.body;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const adminEmail = String(process.env.GOOGLE_ADMIN_EMAIL || "").toLowerCase().trim();

    if (!clientId || !adminEmail) {
      return res.status(500).json({ message: "GOOGLE_CLIENT_ID e GOOGLE_ADMIN_EMAIL precisam estar configurados" });
    }

    if (!credential) {
      return res.status(400).json({ message: "Credencial do Google nao recebida" });
    }

    const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    const perfil = await googleResponse.json().catch(() => ({}));

    if (!googleResponse.ok) {
      return res.status(401).json({ message: "Token do Google invalido" });
    }

    const email = String(perfil.email || "").toLowerCase().trim();
    const aud = String(perfil.aud || "").trim();
    const emailVerificado = perfil.email_verified === true || perfil.email_verified === "true";

    if (aud !== clientId) {
      return res.status(401).json({ message: "Token do Google nao pertence a este aplicativo" });
    }

    if (!emailVerificado) {
      return res.status(401).json({ message: "Email Google nao verificado" });
    }

    if (email !== adminEmail) {
      return res.status(403).json({ message: "Esta conta Google nao tem permissao para acessar o painel" });
    }

    const senhaHash = await bcrypt.hash(`google-only-${email}`, 10);
    const [user] = await User.findOrCreate({
      where: { email },
      defaults: {
        nome: perfil.name || "Administrador",
        email,
        senha: senhaHash,
      },
    });

    if (perfil.name && user.nome !== perfil.name) {
      user.nome = perfil.name;
      await user.save();
    }

    return res.json({
      user: serializarUser(user),
      token: gerarToken(user),
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
