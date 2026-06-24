import fs from "fs";
import path from "path";
import { Op } from "sequelize";
import { Product, Category } from "../models/index.js";
import { slugify } from "../utils/slugify.js";

const uploadDir = path.resolve("uploads");

function montarUrlImagem(req, imagem) {
  if (!imagem) return null;
  if (imagem.startsWith("http") || imagem.startsWith("data:")) return imagem;
  if (imagem.startsWith("/uploads/")) return `${req.protocol}://${req.get("host")}${imagem}`;
  if (imagem.startsWith("uploads/")) return `${req.protocol}://${req.get("host")}/${imagem}`;
  if (imagem.startsWith("assets/")) return imagem;

  const caminhoUpload = path.join(uploadDir, imagem);
  if (fs.existsSync(caminhoUpload)) {
    return `${req.protocol}://${req.get("host")}/uploads/${imagem}`;
  }

  return `assets/${imagem}`;
}

function serializar(req, produto) {
  const obj = produto.toJSON();
  obj.imagemUrl = montarUrlImagem(req, obj.imagem);
  return obj;
}

async function resolverCategoriaId(valor) {
  if (!valor) return null;

  if (!Number.isNaN(Number(valor))) {
    const categoria = await Category.findByPk(Number(valor));
    return categoria ? categoria.id : null;
  }

  const categoria = await Category.findOne({
    where: {
      [Op.or]: [
        { nome: valor },
        { slug: slugify(valor) },
      ],
    },
  });

  return categoria ? categoria.id : null;
}

async function gerarSlugUnico(nome, idIgnorado = null) {
  const base = slugify(nome);
  let slug = base;
  let contador = 2;

  while (true) {
    const where = { slug };
    if (idIgnorado) where.id = { [Op.ne]: idIgnorado };

    const existente = await Product.findOne({ where });
    if (!existente) return slug;

    slug = `${base}-${contador}`;
    contador += 1;
  }
}

function normalizarStatus(body) {
  return body.status || body.disponibilidade || "Ativo";
}

export async function listarProdutos(req, res, next) {
  try {
    const {
      categoria,
      busca,
      ordenar = "recentes",
      pagina = 1,
      limite = 100,
    } = req.query;

    const where = {};

    if (busca) {
      where.nome = { [Op.iLike]: `%${busca}%` };
    }

    const include = [{ model: Category, as: "categoria" }];

    if (categoria && categoria !== "Todos") {
      include[0].where = { slug: slugify(categoria) };
    }

    const ordens = {
      recentes: [["createdAt", "DESC"]],
      menor_preco: [["preco", "ASC"]],
      maior_preco: [["preco", "DESC"]],
      nome: [["nome", "ASC"]],
    };

    const order = ordens[ordenar] || ordens.recentes;
    const limiteNumerico = Math.max(Number(limite) || 100, 1);
    const paginaNumerica = Math.max(Number(pagina) || 1, 1);
    const offset = (paginaNumerica - 1) * limiteNumerico;

    const { rows, count } = await Product.findAndCountAll({
      where,
      include,
      order,
      limit: limiteNumerico,
      offset,
      distinct: true,
    });

    return res.json({
      produtos: rows.map((p) => serializar(req, p)),
      total: count,
      pagina: paginaNumerica,
      totalPaginas: Math.ceil(count / limiteNumerico),
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

export async function buscarPorId(req, res, next) {
  try {
    const { id } = req.params;

    const produto = await Product.findByPk(id, {
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
      categoria,
    } = req.body;

    const categoriaResolvidaId = await resolverCategoriaId(categoryId || categoria);

    if (!nome || !preco || !categoriaResolvidaId) {
      return res.status(400).json({
        message: "Nome, preco e categoria sao obrigatorios",
      });
    }

    const slug = await gerarSlugUnico(nome);

    const produto = await Product.create({
      nome,
      slug,
      preco,
      estoque: estoque || 0,
      status: normalizarStatus(req.body),
      resumo,
      descricao,
      destaque: destaque === true || destaque === "true" || destaque === "Sim",
      categoryId: categoriaResolvidaId,
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

    if (req.body.categoryId !== undefined || req.body.categoria !== undefined) {
      const categoriaResolvidaId = await resolverCategoriaId(req.body.categoryId || req.body.categoria);
      if (!categoriaResolvidaId) {
        return res.status(400).json({ message: "Categoria invalida" });
      }
      produto.categoryId = categoriaResolvidaId;
    }

    const campos = ["preco", "estoque", "resumo", "descricao"];

    for (const campo of campos) {
      if (req.body[campo] !== undefined) {
        produto[campo] = req.body[campo];
      }
    }

    if (req.body.nome) {
      produto.nome = req.body.nome;
      produto.slug = await gerarSlugUnico(req.body.nome, produto.id);
    }

    if (req.body.status !== undefined || req.body.disponibilidade !== undefined) {
      produto.status = normalizarStatus(req.body);
    }

    if (req.body.destaque !== undefined) {
      produto.destaque = req.body.destaque === true || req.body.destaque === "true" || req.body.destaque === "Sim";
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
