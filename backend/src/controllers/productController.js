import { Op } from "sequelize";
import { Product, Category } from "../models/index.js";
import { slugify } from "../utils/slugify.js";

function montarUrlImagem(req, imagem) {
  if (!imagem) return null;
  if (imagem.startsWith("http")) return imagem;
  return `${req.protocol}://${req.get("host")}/uploads/${imagem}`;
}

function serializar(req, produto) {
  const obj = produto.toJSON();
  obj.imagemUrl = montarUrlImagem(req, obj.imagem);
  return obj;
}

export async function listarProdutos(req, res, next) {
  try {
    const {
      categoria,
      busca,
      ordenar = "recentes",
      pagina = 1,
      limite = 12,
    } = req.query;

    const where = {};

    if (busca) {
      where.nome = { [Op.iLike]: `%${busca}%` };
    }

    const include = [{ model: Category, as: "categoria" }];

    if (categoria) {
      include[0].where = { slug: categoria };
    }

    const ordens = {
      recentes: [["createdAt", "DESC"]],
      menor_preco: [["preco", "ASC"]],
      maior_preco: [["preco", "DESC"]],
      nome: [["nome", "ASC"]],
    };

    const order = ordens[ordenar] || ordens.recentes;

    const offset = (Number(pagina) - 1) * Number(limite);

    const { rows, count } = await Product.findAndCountAll({
      where,
      include,
      order,
      limit: Number(limite),
      offset,
      distinct: true,
    });

    return res.json({
      produtos: rows.map((p) => serializar(req, p)),
      total: count,
      pagina: Number(pagina),
      totalPaginas: Math.ceil(count / Number(limite)),
    });
  } catch (err) {
    next(err);
  }
}

export async function listarDestaques(req, res, next) {
  try {
    const produtos = await Product.findAll({
      where: { destaque: true },
      include: [{ model: Category, as: "categoria" }],
      order: [["createdAt", "DESC"]],
      limit: 12,
    });

    return res.json({
      produtos: produtos.map((p) => serializar(req, p)),
    });
  } catch (err) {
    next(err);
  }
}

export async function buscarPorSlug(req, res, next) {
  try {
    const { slug } = req.params;

    const produto = await Product.findOne({
      where: { slug },
      include: [{ model: Category, as: "categoria" }],
    });

    if (!produto) {
      return res.status(404).json({ message: "Produto nao encontrado" });
    }

    return res.json({ produto: serializar(req, produto) });
  } catch (err) {
    next(err);
  }
}

export async function criarProduto(req, res, next) {
  try {
    const {
      nome,
      preco,
      estoque,
      resumo,
      descricao,
      destaque,
      categoryId,
    } = req.body;

    if (!nome || !preco || !categoryId) {
      return res.status(400).json({
        message: "Nome, preco e categoryId sao obrigatorios",
      });
    }

    const categoria = await Category.findByPk(categoryId);

    if (!categoria) {
      return res.status(400).json({ message: "Categoria invalida" });
    }

    const slug = slugify(nome);

    const produto = await Product.create({
      nome,
      slug,
      preco,
      estoque: estoque || 0,
      resumo,
      descricao,
      destaque: destaque === true || destaque === "true",
      categoryId,
      imagem: req.file ? req.file.filename : null,
    });

    const completo = await Product.findByPk(produto.id, {
      include: [{ model: Category, as: "categoria" }],
    });

    return res.status(201).json({ produto: serializar(req, completo) });
  } catch (err) {
    next(err);
  }
}

export async function atualizarProduto(req, res, next) {
  try {
    const { id } = req.params;

    const produto = await Product.findByPk(id);

    if (!produto) {
      return res.status(404).json({ message: "Produto nao encontrado" });
    }

    const campos = ["nome", "preco", "estoque", "resumo", "descricao", "categoryId"];

    for (const campo of campos) {
      if (req.body[campo] !== undefined) {
        produto[campo] = req.body[campo];
      }
    }

    if (req.body.nome) {
      produto.slug = slugify(req.body.nome);
    }

    if (req.body.destaque !== undefined) {
      produto.destaque = req.body.destaque === true || req.body.destaque === "true";
    }

    if (req.file) {
      produto.imagem = req.file.filename;
    }

    await produto.save();

    const completo = await Product.findByPk(produto.id, {
      include: [{ model: Category, as: "categoria" }],
    });

    return res.json({ produto: serializar(req, completo) });
  } catch (err) {
    next(err);
  }
}

export async function removerProduto(req, res, next) {
  try {
    const { id } = req.params;

    const produto = await Product.findByPk(id);

    if (!produto) {
      return res.status(404).json({ message: "Produto nao encontrado" });
    }

    await produto.destroy();

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
