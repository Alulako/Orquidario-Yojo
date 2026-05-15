function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === "SequelizeValidationError") {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({ message: "Registro duplicado" });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token invalido ou expirado" });
  }

  const status = err.status || 500;
  const message = err.message || "Erro interno do servidor";

  return res.status(status).json({ message });
}

export default errorHandler;
