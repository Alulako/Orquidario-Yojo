# Roteiro de execução e explicação do backend — Orquidário Yojo

Este arquivo é um guia para apresentar e rodar o projeto sem se perder. A ideia principal é: o frontend é HTML/CSS/JS puro; o backend é Node.js + Express; o banco é PostgreSQL rodando em Docker; o admin usa login Google restrito a uma única conta autorizada.

---

## 1. O que precisa estar instalado

Cada pessoa do grupo precisa ter:

- Node.js instalado.
- npm instalado junto com o Node.
- Docker Desktop instalado e aberto.
- Python instalado, para servir o frontend com `python -m http.server 5500`.
- Navegador.

Não precisa instalar PostgreSQL direto no Windows. O PostgreSQL roda dentro de um container Docker.

---

## 2. Como rodar o projeto

Abra o Docker Desktop primeiro e espere ele ficar rodando.

### Terminal 1 — banco + backend

Entre na pasta do backend:

```bash
cd C:\Users\analu\Desktop\USP\5osem\WebBruna\Orquidario-Yojo-main\Orquidario-Yojo\backend
```

Instale as dependências, se ainda não instalou:

```bash
npm install
```

Suba apenas o banco PostgreSQL:

```bash
docker compose up -d postgres
```

Confira se o container subiu:

```bash
docker compose ps
```

O esperado é aparecer o container `orquidario_yojo_postgres` como `Up` ou `healthy`.

Rode os seeders para criar dados iniciais no banco:

```bash
npm run seed:admin
npm run seed:categorias
npm run seed:produtos
```

Depois inicie o backend:

```bash
npm run dev
```

Se estiver certo, deve aparecer algo como:

```txt
Conexão com PostgreSQL estabelecida.
Tabelas sincronizadas.
Servidor rodando em http://localhost:3000
```

Deixe esse terminal aberto. Ele é o backend.

### Terminal 2 — frontend

Abra outro terminal na raiz do projeto:

```bash
cd C:\Users\analu\Desktop\USP\5osem\WebBruna\Orquidario-Yojo-main\Orquidario-Yojo
```

Rode o servidor estático do frontend:

```bash
python -m http.server 5500
```

Abra no navegador:

```txt
http://127.0.0.1:5500/frontend/index.html
```

---

## 3. Por que existem dois terminais?

O projeto tem duas partes:

1. Frontend: páginas `.html`, `.css` e `.js`, servidas pelo Python na porta 5500.
2. Backend: API Node.js/Express, servida na porta 3000.

O navegador abre o frontend em:

```txt
http://127.0.0.1:5500/frontend/index.html
```

O JavaScript do frontend chama o backend em:

```txt
http://localhost:3000/api/...
```

Então, para o site funcionar completo, precisa ter:

- frontend ligado na porta 5500;
- backend ligado na porta 3000;
- banco PostgreSQL ligado no Docker.

---

## 4. O que é o banco de dados nesse projeto?

O banco é PostgreSQL.

Ele não está instalado diretamente no Windows. Ele roda em Docker.

No arquivo `backend/docker-compose.yml`, o serviço do banco usa:

```txt
image: postgres:16
container_name: orquidario_yojo_postgres
```

Explicando:

- `postgres:16` é a imagem Docker, ou seja, o pacote/base do PostgreSQL.
- `orquidario_yojo_postgres` é o container, ou seja, o banco rodando de verdade.
- `pgdata` é o volume, onde os dados ficam persistidos.

A porta está assim:

```txt
5433:5432
```

Isso significa:

- dentro do Docker, o PostgreSQL escuta na porta 5432;
- no Windows, a gente acessa pela porta 5433.

Por isso o `.env` do backend deve usar:

```env
DB_HOST=127.0.0.1
DB_PORT=5433
DB_NAME=orquidario_yojo
DB_USER=postgres
DB_PASSWORD=postgres
```

Se usar `DB_PORT=5432` no Windows, provavelmente dá erro de conexão.

---

## 5. Quais tabelas existem?

O Sequelize cria/sincroniza as tabelas a partir dos models.

### Users

Tabela de usuários/admins.

Campos principais:

- `id`
- `nome`
- `email`
- `senha`

Ela é usada para gerar o JWT interno depois que o Google confirma que a conta é autorizada.

### Categories

Tabela de categorias.

Campos principais:

- `id`
- `nome`
- `slug`
- `descricao`

Exemplos:

- Orquídeas
- Adubos
- Vasos
- Acessórios

### Products

Tabela de produtos.

Campos principais:

- `id`
- `nome`
- `slug`
- `preco`
- `estoque`
- `status`
- `resumo`
- `descricao`
- `imagem`
- `destaque`
- `categoryId`

Cada produto pertence a uma categoria. A relação é:

```txt
Category hasMany Product
Product belongsTo Category
```

---

## 6. O que os seeders fazem?

Seeders são scripts que colocam dados iniciais no banco.

```bash
npm run seed:admin
```

Cria/atualiza o admin inicial.

```bash
npm run seed:categorias
```

Cria as categorias iniciais.

```bash
npm run seed:produtos
```

Cria os produtos iniciais.

Eles podem ser rodados de novo. Se os dados já existem, normalmente o script mostra `Existente` e não duplica tudo.

---

## 7. Como funciona a autenticação com uma única conta Google?

O objetivo é: só uma conta Google específica pode entrar no painel admin.

Essa conta fica configurada no `backend/.env`:

```env
GOOGLE_CLIENT_ID=client_id_do_google
GOOGLE_ADMIN_EMAIL=email_autorizado@gmail.com
```

Fluxo completo:

1. A pessoa abre `login.html`.
2. O frontend chama:

```txt
GET /api/auth/google/config
```

3. O backend devolve apenas o `GOOGLE_CLIENT_ID`, que é público e pode ir para o navegador.
4. O frontend carrega o botão oficial do Google.
5. A pessoa escolhe uma conta Google.
6. O Google devolve uma credencial para o frontend.
7. O frontend envia essa credencial para o backend:

```txt
POST /api/auth/google
```

8. O backend valida essa credencial consultando o Google.
9. O backend confere três coisas importantes:

```txt
- O token realmente pertence ao nosso Google Client ID.
- O email da conta Google é verificado.
- O email é exatamente igual ao GOOGLE_ADMIN_EMAIL do .env.
```

10. Se o email for diferente, o backend responde erro 403 e o painel não abre.
11. Se o email for o autorizado, o backend cria/encontra esse usuário na tabela `Users` e gera um token JWT próprio do projeto.
12. O frontend salva esse JWT no `localStorage` como `adminToken`.
13. Para abrir o admin, o frontend chama:

```txt
GET /api/auth/me
Authorization: Bearer <token>
```

14. Se o token for válido, o painel abre.
15. Se não tiver token, token estiver vencido, ou token for falso, volta para `login.html`.

Resumo para falar para a professora:

> O login Google não é validado só no frontend. O frontend recebe a credencial do Google, mas quem decide se pode entrar é o backend. O backend valida o token com o Google, compara o email com `GOOGLE_ADMIN_EMAIL` e só então emite um JWT interno para proteger as rotas administrativas.

---

## 8. O que é JWT nesse projeto?

JWT é um token de sessão.

Depois que o login dá certo, o backend gera um token assinado com `JWT_SECRET`.

O frontend manda esse token nas rotas protegidas assim:

```txt
Authorization: Bearer <token>
```

Rotas protegidas são rotas que alteram dados, como criar, editar e excluir produto.

Exemplo:

```txt
POST /api/produtos
PUT /api/produtos/:id
DELETE /api/produtos/:id
```

Se tentar chamar essas rotas sem token válido, o backend bloqueia.

---

## 9. Como o frontend conversa com o backend?

O frontend usa `fetch()` no JavaScript.

Exemplo conceitual:

```js
fetch('http://localhost:3000/api/produtos')
```

As páginas principais usam:

- `catalogo.html`: busca produtos reais no backend.
- `produto.html`: busca o produto pelo ID real do banco.
- `admin.html`: lista produtos reais do banco.
- `produto-admin.html`: cria ou edita produto no banco.
- `carrinho.html`: calcula frete chamando o backend.
- `checkout.html`: finaliza pedido e abre WhatsApp.

---

## 10. Rotas principais da API

Todas começam com `/api`.

### Autenticação

```txt
GET /api/auth/google/config
```

Devolve o Google Client ID para o frontend montar o botão do Google.

```txt
POST /api/auth/google
```

Recebe a credencial Google, valida se a conta é autorizada e devolve JWT.

```txt
POST /api/auth/login
```

Login tradicional com email/senha. Ficou disponível no backend, mas o fluxo principal atual usa Google.

```txt
GET /api/auth/me
```

Confere se o JWT atual é válido e retorna o usuário logado.

### Categorias

```txt
GET /api/categorias
```

Lista categorias.

```txt
GET /api/categorias/:slug
```

Busca uma categoria por slug.

```txt
POST /api/categorias
PUT /api/categorias/:id
DELETE /api/categorias/:id
```

Criar, editar e remover categoria. Requer token.

### Produtos

```txt
GET /api/produtos
```

Lista produtos.

Aceita filtros como categoria, busca, ordenação e limite.

```txt
GET /api/produtos/destaques
```

Lista produtos em destaque.

```txt
GET /api/produtos/id/:id
```

Busca produto pelo ID real do banco.

```txt
GET /api/produtos/:slug
```

Busca produto pelo slug.

```txt
POST /api/produtos
```

Cria produto. Requer token. Pode receber imagem via upload.

```txt
PUT /api/produtos/:id
```

Edita produto. Requer token. Pode trocar imagem.

```txt
DELETE /api/produtos/:id
```

Exclui produto. Requer token.

### Carrinho e pedido

```txt
POST /api/carrinho/frete
```

Calcula frete.

```txt
POST /api/carrinho/finalizar
```

Valida pedido e gera link do WhatsApp.

### Admin

```txt
GET /api/admin/resumo
```

Retorna resumo administrativo. Requer token.

---

## 11. Como funciona cadastro de produto com imagem?

No painel admin, a página `produto-admin.html` monta um `FormData`.

Esse `FormData` manda campos como:

```txt
nome
preco
estoque
status
resumo
descricao
categoria/categoryId
destaque
imagem
```

A imagem vai no campo `imagem`.

No backend, a rota usa:

```js
upload.single("imagem")
```

Esse upload é feito pelo `multer`.

As imagens enviadas pelo admin ficam em:

```txt
backend/uploads
```

O backend serve essas imagens pela rota estática:

```txt
http://localhost:3000/uploads/NOME_DO_ARQUIVO
```

Os produtos seedados usam imagens que já estavam em:

```txt
frontend/assets
```

O controller de produtos resolve os dois casos: imagem seedada de assets e imagem enviada por upload.

---

## 12. Como funciona o cálculo de frete?

O frete não usa API externa dos Correios. É uma regra simples criada para o projeto.

A função está em:

```txt
backend/src/utils/shippingCalculator.js
```

Regra:

```txt
CEP começando com 01 ou 02 -> R$ 15,00
CEP começando com 1        -> R$ 20,00
outros CEPs                -> R$ 30,00
```

Antes de calcular, o backend limpa o CEP e confere se tem 8 dígitos.

Exemplo:

```json
{
  "cep": "01310100"
}
```

Resposta:

```json
{
  "frete": 15,
  "freteFormatado": "R$ 15,00"
}
```

Para explicar:

> O cálculo de frete é uma simulação determinística por prefixo de CEP. O backend valida o CEP e retorna o valor. Não usamos integração real com Correios porque o foco do projeto é o fluxo de vitrine, carrinho, pedido e integração com backend.

---

## 13. Como funciona a ligação com o WhatsApp?

O número do WhatsApp está em:

```txt
backend/src/config/whatsapp.js
```

Atualmente:

```txt
5511998726880
```

Quando o usuário finaliza o pedido, o frontend envia para:

```txt
POST /api/carrinho/finalizar
```

O backend recebe:

- dados do cliente;
- forma de entrega;
- forma de pagamento;
- itens do carrinho;
- frete.

Depois chama:

```txt
backend/src/utils/whatsappMessage.js
```

Essa função monta uma mensagem com:

- lista de itens;
- subtotal;
- frete;
- total;
- entrega;
- pagamento;
- nome;
- telefone;
- endereço;
- CEP;
- observações.

Depois transforma a mensagem em URL usando:

```txt
https://wa.me/NUMERO?text=MENSAGEM_CODIFICADA
```

O frontend recebe essa URL e abre no navegador.

Resumo para falar:

> O site não envia mensagem sozinho pelo WhatsApp. Ele monta um link oficial `wa.me` com a mensagem preenchida. Quando o cliente clica em finalizar, o WhatsApp abre com o pedido já formatado para o dono da loja.

---

## 14. O carrinho fica no banco?

Não. O carrinho fica no navegador, em `localStorage`.

Isso quer dizer:

- os produtos ficam no banco;
- o carrinho do cliente fica temporariamente no navegador;
- ao finalizar, o carrinho é enviado ao backend para gerar a mensagem do WhatsApp.

Por que isso faz sentido no projeto?

Porque o site não implementa pagamento real nem conta de cliente. É uma vitrine/e-commerce simples que encaminha o pedido para atendimento via WhatsApp.

---

## 15. Checklist para apresentar sem passar vergonha

Antes da apresentação:

1. Abrir Docker Desktop.
2. Rodar no backend:

```bash
cd C:\Users\analu\Desktop\USP\5osem\WebBruna\Orquidario-Yojo-main\Orquidario-Yojo\backend
docker compose up -d postgres
npm run seed:admin
npm run seed:categorias
npm run seed:produtos
npm run dev
```

3. Em outro terminal:

```bash
cd C:\Users\analu\Desktop\USP\5osem\WebBruna\Orquidario-Yojo-main\Orquidario-Yojo
python -m http.server 5500
```

4. Abrir:

```txt
http://127.0.0.1:5500/frontend/index.html
```

5. Testar:

- catálogo carrega produtos;
- abrir produto;
- adicionar ao carrinho;
- calcular frete;
- ir ao checkout;
- finalizar e abrir WhatsApp;
- login admin com conta Google autorizada;
- cadastrar produto;
- ver produto novo no catálogo;
- editar produto;
- excluir produto.

---

## 16. Erros comuns e como responder

### Erro: ECONNREFUSED no backend

Provável causa: banco não está rodando ou `.env` está apontando para porta errada.

Conferir:

```bash
docker compose ps
```

E no `.env`:

```env
DB_HOST=127.0.0.1
DB_PORT=5433
```

### Catálogo não carrega produtos

Provável causa: backend não está rodando na porta 3000.

Conferir se `npm run dev` está ativo.

### Login Google bloqueia a conta

Provável causa: a conta usada não é a conta autorizada no `.env`.

Conferir:

```env
GOOGLE_ADMIN_EMAIL=email_correto@gmail.com
```

### Google reclama de origem não autorizada

No Google Cloud Console, o OAuth Client precisa ter em Authorized JavaScript origins:

```txt
http://127.0.0.1:5500
http://localhost:5500
```

### Imagem enviada no admin não aparece

Conferir se o backend está servindo uploads em:

```txt
http://localhost:3000/uploads/NOME_DO_ARQUIVO
```

E se o arquivo foi salvo em:

```txt
backend/uploads
```

---

## 17. Explicação curta do projeto para a professora

> O Orquidário Yojo é uma vitrine/e-commerce simples para uma loja de orquídeas. O frontend foi feito com HTML, CSS e JavaScript puro. O backend usa Node.js com Express, Sequelize e PostgreSQL. O PostgreSQL roda em Docker, então ninguém precisa instalar o banco diretamente na máquina. Os produtos e categorias são persistidos no banco. O painel administrativo é protegido por login Google restrito a uma única conta autorizada no `.env`. Depois que o Google valida a conta, o backend gera um JWT interno para proteger as rotas de criação, edição e exclusão. O carrinho fica no localStorage do navegador, o frete é calculado no backend por regra de prefixo de CEP, e a finalização do pedido gera um link do WhatsApp com a mensagem do pedido formatada.
