import dotenv from "dotenv";
dotenv.config();

import { sequelize, Category } from "../models/index.js";
import { slugify } from "../utils/slugify.js";

const categorias = [
  {
    nome: "Orquídeas",
    descricao: "Espécies e híbridos selecionados para presentear, decorar e colecionar.",
  },
  {
    nome: "Adubos",
    descricao: "Produtos para manutenção saudável, nutrição e estímulo à floração.",
  },
  {
    nome: "Vasos",
    descricao: "Modelos funcionais e delicados para valorizar cada planta no cultivo.",
  },
  {
    nome: "Acessórios",
    descricao: "Itens úteis para organização, cuidado diário e apoio ao desenvolvimento.",
  },
];

async function seedCategorias() {
  try {
    await sequelize.authenticate();
    console.log("Conexao com o banco estabelecida.");

    await sequelize.sync();
    console.log("Tabelas sincronizadas.");

    for (const dados of categorias) {
      const slug = slugify(dados.nome);
      const [cat, created] = await Category.findOrCreate({
        where: { slug },
        defaults: { ...dados, slug },
      });

      console.log(`  ${created ? "Criada" : "Existente"}: ${cat.nome}`);
    }

    console.log("Seeder de categorias finalizado.");
    await sequelize.close();
  } catch (err) {
    console.error("Erro ao rodar seeder:", err);
    process.exit(1);
  }
}

seedCategorias();
