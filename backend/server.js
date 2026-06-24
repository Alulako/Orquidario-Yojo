import dotenv from "dotenv";
import path from "path";
dotenv.config();

import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import routes from "./src/routes/index.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import { sequelize } from "./src/models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, 'frontend')));

app.use("/api", routes);

app.use(errorHandler);

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Conexão com PostgreSQL estabelecida.");
    await sequelize.sync({ alter: true });
    console.log("Tabelas sincronizadas.");
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Erro ao iniciar o servidor:", err);
    process.exit(1);
  }
}

start();
