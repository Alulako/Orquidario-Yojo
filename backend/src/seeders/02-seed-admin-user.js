import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { sequelize, User } from "../models/index.js";

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    console.log("Conexao com o banco estabelecida.");

    await sequelize.sync();
    console.log("Tabelas sincronizadas.");

    const email = "admin@orquidarioyojo.com.br";
    const senhaPlain = "admin123";
    const senhaHash = await bcrypt.hash(senhaPlain, 10);

    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        nome: "Admin Orquidario Yojo",
        email,
        senha: senhaHash,
      },
    });

    if (created) {
      console.log("Admin criado com sucesso!");
    } else {
      user.senha = senhaHash;
      await user.save();
      console.log("Admin ja existia. Senha atualizada.");
    }

    console.log(`  Email: ${email}`);
    console.log(`  Senha: ${senhaPlain}`);

    await sequelize.close();
  } catch (err) {
    console.error("Erro ao rodar seeder:", err);
    process.exit(1);
  }
}

seedAdmin();
