import { Op, fn, col } from "sequelize";
import { Product, Category } from "../models/index.js";

export async function resumo(req, res, next) {
  try {
    const totalProdutos = await Product.count();
    const totalCategorias = await Category.count();
    const totalDestaques = await Product.count({ where: { destaque: true } });

    const estoqueBaixo = await Product.count({
      where: { estoque: { [Op.lte]: 5 } },
    });

    const semEstoque = await Product.count({
      where: { estoque: 0 },
    });

    const produtosPorCategoria = await Product.findAll({
      attributes: [
        "categoryId",
        [fn("COUNT", col("Product.id")), "total"],
      ],
      include: [
        {
          model: Category,
          as: "categoria",
          attributes: ["nome", "slug"],
        },
      ],
      group: ["Product.categoryId", "categoria.id"],
      raw: false,
    });

    return res.json({
      totalProdutos,
      totalCategorias,
      totalDestaques,
      estoqueBaixo,
      semEstoque,
      produtosPorCategoria: produtosPorCategoria.map((p) => ({
        categoria: p.categoria?.nome,
        slug: p.categoria?.slug,
        total: Number(p.get("total")),
      })),
    });
  } catch (err) {
    next(err);
  }
}
