# Orquidário Yojo - Backend

Backend da vitrine virtual Orquidário Yojo, desenvolvido para a disciplina SCC0219.

O projeto usa:

- Node.js + Express para a API.
- Sequelize como ORM.
- PostgreSQL como banco de dados.
- Docker para rodar o PostgreSQL localmente.
- JWT para proteger rotas administrativas.
- Google Identity Services para login administrativo restrito a uma conta.
- Multer para upload de imagens de produtos.

---

## 1. Visão geral

O projeto tem três partes principais:

```txt
frontend/         -> HTML, CSS e JavaScript puro
backend/          -> API Node.js/Express
Docker/PostgreSQL -> banco de dados local
```

Fluxo geral:

```txt
Navegador
  -> abre o frontend em http://127.0.0.1:5500
  -> frontend chama o backend em http://localhost:3000/api
  -> backend consulta/salva dados no PostgreSQL
  -> PostgreSQL roda dentro de um container Docker
```

---

## 2. Pré-requisitos

Antes de rodar, é necessário ter instalado:

- Node.js 18 ou superior.
- npm.
- Docker Desktop instalado e aberto.
- Python instalado, para servir o frontend localmente.

Não é necessário instalar PostgreSQL diretamente na máquina. O banco roda dentro do Docker.

---

## 3. Configuração do ambiente

Entre na pasta do backend:

```bash
cd backend
```

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

No PowerShell, se o comando acima não funcionar:

```powershell
Copy-Item .env.example .env
```

Para rodar o backend pelo Node local e o banco pelo Docker, o `.env` deve seguir este formato:

```env
PORT=3000

DB_HOST=127.0.0.1
DB_PORT=5433
DB_NAME=orquidario_yojo
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=chave-local-de-desenvolvimento
JWT_EXPIRES_IN=24h

WHATSAPP_NUMBER=5511998726880

GOOGLE_CLIENT_ID=client-id-do-google
GOOGLE_ADMIN_EMAIL=email-admin-autorizado
```

Importante:

```txt
Não commitar o .env real.
O repositório deve versionar apenas o .env.example.
```

---

## 4. Como rodar o projeto

Abra o Docker Desktop antes de começar.

### Terminal 1 - banco e backend

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Suba somente o banco PostgreSQL:

```bash
docker compose up -d postgres
```

Confira se o banco está rodando:

```bash
docker compose ps
```

Rode os seeders:

```bash
npm run seed:admin
npm run seed:categorias
npm run seed:produtos
```

Inicie o backend:

```bash
npm run dev
```

Saída esperada:

```txt
Conexão com PostgreSQL estabelecida.
Tabelas sincronizadas.
Servidor rodando em http://localhost:3000
```

Deixe esse terminal aberto.

---

### Terminal 2 - frontend

Na raiz do projeto:

```bash
python -m http.server 5500
```

Abra no navegador:

```txt
http://127.0.0.1:5500/frontend/index.html
```

---

## 5. Por que usar dois terminais?

O frontend e o backend rodam separados.

O frontend roda em:

```txt
http://127.0.0.1:5500
```

O backend roda em:

```txt
http://localhost:3000
```

O JavaScript do frontend chama a API do backend usando `fetch()`.

Exemplo:

```js
fetch("http://localhost:3000/api/produtos")
```

Então, para o sistema completo funcionar, precisam estar ativos:

```txt
Docker/PostgreSQL -> banco de dados
Backend Express   -> API
Frontend Python   -> site no navegador
```

---

## 6. Por que usar `docker compose up -d postgres`?

O `docker-compose.yml` tem dois serviços:

```txt
postgres
backend
```

No desenvolvimento local, usamos:

```txt
Docker -> apenas para o PostgreSQL
Node local -> para rodar o backend com npm run dev
Python local -> para servir o frontend
```

Por isso o comando recomendado é:

```bash
docker compose up -d postgres
```

Se usar apenas:

```bash
docker compose up -d
```

o Docker pode tentar subir também o backend containerizado, o que pode confundir ou disputar a porta 3000 com o `npm run dev`.

---

## 7. Banco de dados

O banco é PostgreSQL 16 rodando no Docker.

No `docker-compose.yml`, o serviço do banco usa:

```txt
image: postgres:16
container_name: orquidario_yojo_postgres
```

A porta está configurada assim:

```txt
5433:5432
```

Isso significa:

```txt
Dentro do Docker: PostgreSQL usa 5432
No Windows: o backend acessa pela porta 5433
```

Por isso, no `.env` local:

```env
DB_HOST=127.0.0.1
DB_PORT=5433
```

Os dados ficam persistidos no volume Docker `pgdata`.

Para apagar o banco local e recriar do zero:

```bash
docker compose down -v
docker compose up -d postgres
npm run seed:admin
npm run seed:categorias
npm run seed:produtos
```

Atenção: `docker compose down -v` apaga os dados locais do banco.

---

## 8. Tabelas principais

### Users

Guarda usuários administrativos.

Campos principais:

```txt
id
nome
email
senha
```

### Categories

Guarda categorias do catálogo.

Campos principais:

```txt
id
nome
slug
descricao
```

Exemplos:

```txt
Orquídeas
Adubos
Vasos
Acessórios
```

### Products

Guarda produtos reais do catálogo.

Campos principais:

```txt
id
nome
slug
preco
estoque
status
resumo
descricao
imagem
destaque
categoryId
```

Relação:

```txt
Category hasMany Product
Product belongsTo Category
```

Ou seja: uma categoria tem vários produtos, e cada produto pertence a uma categoria.

---

## 9. Seeders

Seeders são scripts que criam dados iniciais no banco.

```bash
npm run seed:admin
```

Cria ou atualiza o usuário administrativo inicial.

```bash
npm run seed:categorias
```

Cria as categorias iniciais.

```bash
npm run seed:produtos
```

Cria os produtos iniciais.

Eles podem ser rodados novamente. Se os registros já existirem, o script não duplica tudo.

---

## 10. Autenticação Google restrita a uma conta

O painel administrativo usa login Google, mas somente uma conta específica pode entrar.

A conta autorizada fica no `.env`:

```env
GOOGLE_ADMIN_EMAIL=email-admin-autorizado
```

Fluxo:

```txt
1. O usuário abre login.html.
2. O frontend chama GET /api/auth/google/config.
3. O backend devolve o GOOGLE_CLIENT_ID.
4. O frontend renderiza o botão oficial do Google.
5. O usuário escolhe uma conta Google.
6. O Google devolve uma credencial.
7. O frontend envia essa credencial para POST /api/auth/google.
8. O backend valida a credencial com o Google.
9. O backend confere se o email é igual ao GOOGLE_ADMIN_EMAIL.
10. Se for diferente, bloqueia.
11. Se for autorizado, gera um JWT interno.
12. O painel admin usa esse JWT para acessar rotas protegidas.
```

Resumo para apresentação:

```txt
O Google autentica a identidade da pessoa, mas quem autoriza o acesso é o backend.
O backend compara o email autenticado com o GOOGLE_ADMIN_EMAIL configurado no .env.
Só essa conta consegue acessar o painel administrativo.
```

No Google Cloud Console, em **Authorized JavaScript origins**, adicionar:

```txt
http://127.0.0.1:5500
http://localhost:5500
```

---

## 11. JWT

JWT é o token interno usado pelo backend para proteger o painel administrativo.

Depois que o Google valida a conta autorizada, o backend gera um token.

O frontend salva esse token no `localStorage` como `adminToken`.

Nas rotas protegidas, o frontend envia:

```txt
Authorization: Bearer <token>
```

Rotas protegidas incluem:

```txt
POST /api/produtos
PUT /api/produtos/:id
DELETE /api/produtos/:id
GET /api/auth/me
GET /api/admin/resumo
```

Se o token estiver ausente, inválido ou vencido, o backend bloqueia.

---

## 12. Rotas da API

Todas as rotas começam com:

```txt
/api
```

### Autenticação

| Método | Rota | Protegida | Função |
|---|---|---|---|
| GET | `/auth/google/config` | Não | Retorna o Client ID público do Google. |
| POST | `/auth/google` | Não | Valida login Google e gera JWT. |
| POST | `/auth/login` | Não | Login tradicional por email/senha mantido no backend. |
| GET | `/auth/me` | Sim | Valida JWT e retorna usuário logado. |

### Produtos

| Método | Rota | Protegida | Função |
|---|---|---|---|
| GET | `/produtos` | Não | Lista produtos. |
| GET | `/produtos/destaques` | Não | Lista produtos em destaque. |
| GET | `/produtos/id/:id` | Não | Busca produto pelo ID real do banco. |
| GET | `/produtos/:slug` | Não | Busca produto pelo slug. |
| POST | `/produtos` | Sim | Cria produto. Aceita upload de imagem. |
| PUT | `/produtos/:id` | Sim | Edita produto. Aceita troca de imagem. |
| DELETE | `/produtos/:id` | Sim | Exclui produto. |

### Categorias

| Método | Rota | Protegida | Função |
|---|---|---|---|
| GET | `/categorias` | Não | Lista categorias. |
| GET | `/categorias/:slug` | Não | Busca categoria por slug. |
| POST | `/categorias` | Sim | Cria categoria. |
| PUT | `/categorias/:id` | Sim | Edita categoria. |
| DELETE | `/categorias/:id` | Sim | Exclui categoria. |

### Carrinho

| Método | Rota | Protegida | Função |
|---|---|---|---|
| POST | `/carrinho/frete` | Não | Calcula frete. |
| POST | `/carrinho/finalizar` | Não | Gera link do WhatsApp com pedido formatado. |

### Admin

| Método | Rota | Protegida | Função |
|---|---|---|---|
| GET | `/admin/resumo` | Sim | Retorna resumo do painel administrativo. |

---

## 13. CRUD de produtos

O painel administrativo manipula produtos reais do banco.

Páginas envolvidas:

```txt
frontend/admin.html
frontend/produto-admin.html
frontend/catalogo.html
frontend/produto.html
```

Fluxo:

```txt
admin.html
  -> busca produtos em GET /api/produtos

produto-admin.html
  -> cria produto com POST /api/produtos
  -> edita produto com PUT /api/produtos/:id

catalogo.html
  -> exibe produtos vindos de GET /api/produtos

produto.html?id=ID
  -> busca detalhes em GET /api/produtos/id/:id
```

---

## 14. Upload de imagens

O cadastro e a edição de produto usam `FormData`.

O campo da imagem se chama:

```txt
imagem
```

O backend usa Multer:

```js
upload.single("imagem")
```

As imagens enviadas pelo admin ficam em:

```txt
backend/uploads
```

O backend serve essas imagens em:

```txt
http://localhost:3000/uploads/nome-do-arquivo
```

Produtos iniciais seedados podem usar imagens já existentes em:

```txt
frontend/assets
```

---

## 15. Carrinho

O carrinho não fica no banco. Ele fica no `localStorage` do navegador.

O banco guarda:

```txt
produtos
categorias
usuários/admins
```

O carrinho guarda temporariamente:

```txt
itens escolhidos
quantidades
frete calculado
CEP
```

Isso faz sentido porque o projeto não tem login de cliente nem pagamento real. A finalização do pedido é feita pelo WhatsApp.

---

## 16. Cálculo de frete

O frete é calculado no backend em:

```txt
backend/src/utils/shippingCalculator.js
```

Regra:

```txt
CEP começando com 01 ou 02 -> R$ 15,00
CEP começando com 1        -> R$ 20,00
outros CEPs                -> R$ 30,00
```

Exemplo de request:

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

Resumo para apresentação:

```txt
O frete é uma simulação determinística por prefixo de CEP.
O backend valida se o CEP tem 8 dígitos e retorna o valor formatado.
Não usamos API real dos Correios porque o foco é demonstrar o fluxo do sistema.
```

---

## 17. WhatsApp

A finalização do pedido chama:

```txt
POST /api/carrinho/finalizar
```

O backend monta uma mensagem com:

```txt
itens
subtotal
frete
total
entrega
pagamento
nome
telefone
endereço
CEP
observações
```

Depois gera uma URL oficial do WhatsApp:

```txt
https://wa.me/NUMERO?text=MENSAGEM_CODIFICADA
```

O site não envia a mensagem sozinho. Ele abre o WhatsApp com o texto preenchido.

Resumo para apresentação:

```txt
A integração com WhatsApp é feita por link wa.me.
O backend gera a mensagem formatada do pedido e devolve a URL para o frontend abrir.
```

---

## 18. Scripts disponíveis

| Script | Função |
|---|---|
| `npm run dev` | Inicia o backend com nodemon. |
| `npm start` | Inicia o backend com Node. |
| `npm run seed:admin` | Cria/atualiza o admin inicial. |
| `npm run seed:categorias` | Cria categorias iniciais. |
| `npm run seed:produtos` | Cria produtos iniciais. |
| `npm run seed:all` | Roda todos os seeders. |
| `npm run db:up` | Sobe os serviços do Docker Compose. |
| `npm run db:down` | Para os serviços do Docker Compose. |
| `npm run db:reset` | Apaga o volume do banco e recria do zero. |

---

## 19. Checklist antes da apresentação

Rodar:

```bash
cd backend
docker compose up -d postgres
npm run seed:admin
npm run seed:categorias
npm run seed:produtos
npm run dev
```

Em outro terminal:

```bash
python -m http.server 5500
```

Abrir:

```txt
http://127.0.0.1:5500/frontend/index.html
```

Testar:

```txt
catálogo carrega produtos
página de produto abre
produto entra no carrinho
frete calcula
checkout abre WhatsApp
login Google bloqueia conta errada
login Google aceita conta autorizada
admin lista produtos
admin cadastra produto
produto novo aparece no catálogo
admin edita produto
admin exclui produto
```

---

## 20. Problemas comuns

### Erro `ECONNREFUSED`

Provável causa: banco desligado ou porta errada.

Verificar:

```bash
docker compose ps
```

E conferir no `.env`:

```env
DB_HOST=127.0.0.1
DB_PORT=5433
```

### Google bloqueia login

Conferir:

```env
GOOGLE_ADMIN_EMAIL=email-admin-autorizado
```

E no Google Cloud Console:

```txt
http://127.0.0.1:5500
http://localhost:5500
```

### Produtos não aparecem

Rodar:

```bash
npm run seed:categorias
npm run seed:produtos
npm run dev
```

### Upload não aparece

Conferir se a imagem foi salva em:

```txt
backend/uploads
```

E se o backend está servindo:

```txt
http://localhost:3000/uploads/nome-do-arquivo
```

---

## 21. Explicação curta para a professora

O Orquidário Yojo é uma vitrine/e-commerce simples feita com frontend em HTML, CSS e JavaScript puro. O backend usa Node.js, Express, Sequelize e PostgreSQL. O PostgreSQL roda em Docker, então não precisamos instalar o banco diretamente na máquina. Os produtos e categorias são persistidos no banco. O painel administrativo usa login Google restrito a uma única conta autorizada no `.env`. Após validar a conta Google, o backend gera um JWT para proteger as rotas administrativas. O carrinho fica no `localStorage`, o frete é calculado no backend por prefixo de CEP e a finalização gera um link do WhatsApp com o pedido formatado.
