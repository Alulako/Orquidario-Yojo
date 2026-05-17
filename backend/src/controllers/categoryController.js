import { Category, Product } from "../models/index.js";
import { slugify } from "../utils/slugify.js";

export async function listarCategorias(req, res, next) {
  try {
    const categorias = await Category.findAll({
      order: [["nome", "ASC"]],
    });

    return res.json({ categorias });
  } catch (err) {
    next(err);
  }
}

export async function buscarPorSlug(req, res, next) {
  try {
    const { slug } = req.params;

    const categoria = await Category.findOne({
      where: { slug },
      include: [{ model: Product, as: "produtos" }],
    });

    if (!categoria) {
      return res.status(404).json({ message: "Categoria nao encontrada" });
    }

    return res.json({ categoria });
  } catch (err) {
    next(err);
  }
}

export async function criarCategoria(req, res, next) {
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "Nome e obrigatorio" });
    }

    const slug = slugify(nome);

    const categoria = await Category.create({ nome, slug, descricao });

    return res.status(201).json({ categoria });
  } catch (err) {
    next(err);
  }
}

export async function atualizarCategoria(req, res, next) {
  try {
    const { id } = req.params;
    const { nome, descricao } = req.body;

    const categoria = await Category.findByPk(id);

    if (!categoria) {
      return res.status(404).json({ message: "Categoria nao encontrada" });
    }

    if (nome) {
      categoria.nome = nome;
      categoria.slug = slugify(nome);
    }

    if (descricao !== undefined) {
      categoria.descricao = descricao;
    }

    await categoria.save();

    return res.json({ categoria });
  } catch (err) {
    next(err);
  }
}

export async function removerCategoria(req, res, next) {
  try {
    const { id } = req.params;

    const categoria = await Category.findByPk(id);

    if (!categoria) {
      return res.status(404).json({ message: "Categoria nao encontrada" });
    }

    const totalProdutos = await Product.count({ where: { categoryId: id } });

    if (totalProdutos > 0) {
      return res.status(409).json({
        message: "Categoria possui produtos vinculados",
      });
    }

    await categoria.destroy();

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
