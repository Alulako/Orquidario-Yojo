import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      String(process.env.DB_PASSWORD),
      {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        dialect: "postgres",
        logging: false,
      }
    );

export default sequelize;
