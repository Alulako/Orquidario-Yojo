import dotenv from "dotenv";
dotenv.config();

import { sequelize, Category, Product } from "../models/index.js";
import { slugify } from "../utils/slugify.js";

const produtos = [
  {
    nome: "Orquídea Phalaenopsis Branca",
    categoria: "Orquídeas",
    preco: 89.9,
    estoque: 14,
    destaque: true,
    imagem: "OrquideaBranca.png",
    resumo: "Flor delicada e sofisticada, ideal para presentear ou compor ambientes elegantes.",
    descricao: "A Orquídea Phalaenopsis Branca é uma das variedades mais procuradas por sua floração marcante e visual refinado.",
  },
  {
    nome: "Orquídea Dendrobium Lilás",
    categoria: "Orquídeas",
    preco: 74.5,
    estoque: 10,
    destaque: true,
    imagem: "Roxa.png",
    resumo: "Opção charmosa com coloração suave para colecionadores e decoração natural.",
    descricao: "A Dendrobium Lilás destaca-se pelos tons florais que trazem tranquilidade ao ambiente.",
  },
  {
    nome: "Orquídea Oncidium Rosa",
    categoria: "Orquídeas",
    preco: 67.9,
    estoque: 8,
    destaque: true,
    imagem: "rosa.png",
    resumo: "Perfil delicado e floral para quem busca leveza e presença visual no ambiente.",
    descricao: "A Oncidium oferece cachos abundantes de flores pequenas e muito vibrantes.",
  },
  {
    nome: "Orquídea Amarela Premium",
    categoria: "Orquídeas",
    preco: 94.0,
    estoque: 6,
    destaque: true,
    imagem: "amarelo.png",
    resumo: "Variedade marcante com flores luminosas para compor ambientes com destaque.",
    descricao: "Traz alegria e vivacidade para qualquer ambiente, com flores grandes e cor intensa.",
  },
  {
    nome: "Mini Orquídea para Presente",
    categoria: "Orquídeas",
    preco: 49.9,
    estoque: 4,
    destaque: false,
    imagem: "verdebranca.png",
    resumo: "Formato compacto com apresentação delicada, ideal para lembranças especiais.",
    descricao: "Arranjo super delicado e compacto, perfeito para decorar pequenos espaços ou presentear.",
  },
  {
    nome: "Adubo Líquido para Floração",
    categoria: "Adubos",
    preco: 24.9,
    estoque: 30,
    destaque: true,
    imagem: "spray.png",
    resumo: "Fórmula prática para manutenção frequente e estímulo de florações vigorosas.",
    descricao: "Adubo desenvolvido para fornecer nutrientes na fase de floração das orquídeas.",
  },
  {
    nome: "Adubo Granulado de Manutenção",
    categoria: "Adubos",
    preco: 31.9,
    estoque: 0,
    destaque: false,
    imagem: "adubogranulado.png",
    resumo: "Indicado para rotinas periódicas de cuidado com foco em nutrição equilibrada.",
    descricao: "Fertilizante de liberação lenta que fornece nutrientes por até 3 meses.",
  },
  {
    nome: "Vaso Decorativo Bege Claro",
    categoria: "Vasos",
    preco: 36.9,
    estoque: 20,
    destaque: true,
    imagem: "vaso2.png",
    resumo: "Modelo versátil com acabamento leve para valorizar arranjos e plantas ornamentais.",
    descricao: "Vaso de alta qualidade com acabamento impecável, ideal para orquídeas.",
  },
  {
    nome: "Vaso Cerâmico Texturizado",
    categoria: "Vasos",
    preco: 42.0,
    estoque: 12,
    destaque: false,
    imagem: "vaso.png",
    resumo: "Peça com aparência refinada para complementar projetos florais com suavidade.",
    descricao: "Vaso de cerâmica com textura exclusiva que traz um toque rústico e sofisticado.",
  },
  {
    nome: "Substrato Especial para Orquídeas",
    categoria: "Acessórios",
    preco: 18.5,
    estoque: 25,
    destaque: true,
    imagem: "paraorquidea.png",
    resumo: "Mistura pensada para favorecer drenagem, aeração e adaptação no replantio.",
    descricao: "Substrato premium com casca de pinus, carvão e esfagno.",
  },
  {
    nome: "Kit Básico de Cultivo",
    categoria: "Acessórios",
    preco: 58.0,
    estoque: 3,
    destaque: true,
    imagem: "kit.png",
    resumo: "Conjunto com itens úteis para rotina de manutenção e cuidado diário das plantas.",
    descricao: "Tudo o que precisa para iniciar os cuidados com a sua nova planta.",
  },
  {
    nome: "Borrifador de Névoa Fina",
    categoria: "Acessórios",
    preco: 27.9,
    estoque: 18,
    destaque: false,
    imagem: "borrifador.png",
    resumo: "Acessório prático para manutenção delicada da umidade em plantas ornamentais.",
    descricao: "Borrifador com gatilho ergonômico que produz uma névoa contínua e ultrafina.",
  },
];

async function seedProdutos() {
  try {
    await sequelize.authenticate();
    console.log("Conexao com o banco estabelecida.");

    await sequelize.sync({ alter: true });
    console.log("Tabelas sincronizadas.");

    const mapaCategorias = {};
    const todas = await Category.findAll();

    if (todas.length === 0) {
      console.error("Nenhuma categoria encontrada. Rode npm run seed:categorias antes.");
      process.exit(1);
    }

    for (const c of todas) {
      mapaCategorias[c.nome] = c.id;
    }

    for (const dados of produtos) {
      const categoryId = mapaCategorias[dados.categoria];

      if (!categoryId) {
        console.warn(`  Categoria "${dados.categoria}" nao encontrada para ${dados.nome}.`);
        continue;
      }

      const slug = slugify(dados.nome);

      const [produto, created] = await Product.findOrCreate({
        where: { slug },
        defaults: {
          nome: dados.nome,
          slug,
          preco: dados.preco,
          estoque: dados.estoque,
          status: dados.estoque > 0 ? "Ativo" : "Inativo",
          resumo: dados.resumo,
          descricao: dados.descricao,
          destaque: dados.destaque,
          imagem: dados.imagem,
          categoryId,
        },
      });

      console.log(`  ${created ? "Criado" : "Existente"}: ${produto.nome}`);
    }

    console.log("Seeder de produtos finalizado.");
    await sequelize.close();
  } catch (err) {
    console.error("Erro ao rodar seeder:", err);
    process.exit(1);
  }
}

seedProdutos();
