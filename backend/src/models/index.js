import sequelize from "../config/database.js";
import User from "./User.js";
import Category from "./Category.js";
import Product from "./Product.js";

Category.hasMany(Product, {
  foreignKey: "categoryId",
  as: "produtos",
  onDelete: "RESTRICT",
});

Product.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "categoria",
});

export { sequelize, User, Category, Product };
