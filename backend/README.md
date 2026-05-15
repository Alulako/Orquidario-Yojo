# Orquidario Yojo - Backend

Backend da vitrine virtual do Orquidario Yojo, disciplina SCC0219.

## Pre-requisitos

- Node.js 18+
- PostgreSQL instalado e rodando

## Instalacao

```bash
cd backend
npm install
```

## Banco de dados

Crie o banco no PostgreSQL:

```sql
CREATE DATABASE orquidario_yojo;
```

## Configuracao

Copie o arquivo de exemplo e ajuste se necessario:

```bash
cp .env.example .env
```

Variaveis do `.env`:

| Variavel | Descricao | Padrao |
|----------|-----------|--------|
| PORT | Porta do servidor | 3000 |
| DB_HOST | Host do PostgreSQL | localhost |
| DB_PORT | Porta do PostgreSQL | 5432 |
| DB_NAME | Nome do banco | orquidario_yojo |
| DB_USER | Usuario do banco | postgres |
| DB_PASSWORD | Senha do banco | postgres |
| JWT_SECRET | Chave secreta do JWT | orquidario-yojo-secret-2024 |
| JWT_EXPIRES_IN | Expiracao do token | 24h |

## Seed do admin

Cria o usuario administrador no banco:

```bash
npm run seed:admin
```

Credenciais padrao:
- Email: `admin@orquidarioyojo.com.br`
- Senha: `admin123`

**IMPORTANTE:** Altere a senha em ambiente de producao.

## Executar

Desenvolvimento (com hot reload):

```bash
npm run dev
```

Producao:

```bash
npm start
```

O servidor sobe em `http://localhost:3000`.

## Rotas disponiveis

### POST /api/auth/login

Autentica o admin e retorna um token JWT.

**Body (JSON):**

```json
{
  "email": "admin@orquidarioyojo.com.br",
  "senha": "admin123"
}
```

**Resposta (200):**

```json
{
  "user": {
    "id": 1,
    "nome": "Admin Orquidario Yojo",
    "email": "admin@orquidarioyojo.com.br"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### GET /api/auth/me

Retorna os dados do admin logado. Requer token.

**Header:**

```
Authorization: Bearer <token>
```

**Resposta (200):**

```json
{
  "user": {
    "id": 1,
    "nome": "Admin Orquidario Yojo",
    "email": "admin@orquidarioyojo.com.br"
  }
}
```

## Testando com Postman/Insomnia

1. Envie `POST /api/auth/login` com email e senha no body
2. Copie o `token` da resposta
3. Envie `GET /api/auth/me` com header `Authorization: Bearer <token>`
