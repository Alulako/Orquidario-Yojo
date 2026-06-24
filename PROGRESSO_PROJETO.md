# Progresso do Projeto - Orquidário Yojo

## 1. Contexto geral

Projeto de vitrine/e-commerce simples para o Orquidário Yojo. O foco desta rodada foi estabilizar o fluxo cliente: produto, carrinho, frete, checkout e WhatsApp.

Tecnologias identificadas: HTML, CSS e JavaScript puro no front; Node.js/Express no backend; PostgreSQL via Docker; Sequelize; JWT; multer.

## 2. Regras do projeto

* Não alterar visual, layout, cores, fontes ou identidade.
* Corrigir funcionalidades e integração.
* Priorizar estabilidade para apresentação.
* Documentar apenas o que foi realmente feito.

## 3. Como rodar o projeto

Backend, conforme documentação encontrada:

```bash
cd backend
npm install
docker compose up -d
npm run seed:admin
npm run seed:categorias
npm run seed:produtos
npm run dev
```

Front-end local recomendado para apresentação, usando servidor Python a partir da raiz do repositório:

```bash
python -m http.server 5500
```

Se o comando `python` não funcionar no Windows:

```bash
py -m http.server 5500
```

URL para abrir no navegador:

* `http://127.0.0.1:5500/frontend/index.html`

Backend esperado, caso seja usado:

* `http://localhost:3000`

## 4. Bugs e progresso

### 4.1 Cálculo de CEP/frete

* Status: Corrigido no front; teste manual completo pendente.
* Problema observado: chamada relativa para API e ausência de feedback de erro.
* Causa encontrada: o front roda em porta diferente do backend.
* Correção feita: `frontend/carrinho.html` agora valida CEP com 8 dígitos, aceita CEP com ou sem hífen, chama a API correta quando roda no Live Server, atualiza frete/total/localStorage e tem fallback local simples.
* Arquivos alterados: `frontend/carrinho.html`.
* Como testar: abrir carrinho, digitar `01310-100`, clicar em calcular e verificar frete/total.
* Observações: sem mudança de CSS/layout.

### 4.2 Finalização do pedido via WhatsApp

* Status: Corrigido no front; teste manual completo pendente.
* Problema observado: botão exibia erro genérico ao finalizar.
* Causa encontrada: chamada relativa e incompatibilidade entre dados do front e validação do backend.
* Correção feita: `frontend/checkout.html` agora monta a mensagem no próprio front e abre WhatsApp com número da loja.
* Arquivos alterados: `frontend/checkout.html`.
* Como testar: adicionar produto, calcular frete, ir ao checkout, preencher nome/telefone, escolher pagamento e confirmar.
* Observações: mensagem inclui produtos, quantidades, subtotais, frete, total, pagamento, cliente e endereço quando preenchido.

### 4.3 Imagens dos produtos no carrinho

* Status: Corrigido para produtos adicionados pela página de produto; teste manual pendente.
* Problema observado: placeholder aparecia no carrinho.
* Causa encontrada: caminho de imagem era salvo/montado de forma incorreta.
* Correção feita: `frontend/produto.html` preserva o caminho original da imagem; `frontend/carrinho.html` resolve caminhos de assets, uploads, URL absoluta e base64.
* Arquivos alterados: `frontend/produto.html`, `frontend/carrinho.html`.
* Como testar: abrir um produto, adicionar ao carrinho e verificar a imagem.
* Observações: placeholder continua apenas como fallback real.

### 4.4 Cadastro de produto com imagem

* Status: Corrigido para demonstração local.
* Problema observado: tela tinha input de arquivo, mas salvar parecia não fazer nada.
* Causa encontrada: formulário visual sem integração clara com catálogo e sem feedback forte para o usuário.
* Correção feita: `frontend/produto-admin.js` salva o produto no `localStorage`, aceita imagem selecionada, mostra confirmação e redireciona para o catálogo.
* Arquivos alterados: `frontend/produto-admin.html`, `frontend/produto-admin.js`, `frontend/catalogo.html`, `frontend/produto.html`.
* Como testar: entrar pelo login, abrir painel, clicar em adicionar novo produto, preencher nome/preço/imagem, salvar e conferir no catálogo.
* Observações: cadastro fica salvo apenas no navegador usado na apresentação, não no banco.

### 4.5 Login com Google / acesso administrativo

* Status: Resolvido como simulação local para apresentação.
* Problema observado: o botão de Google era apenas link visual e o painel não criava sessão.
* Decisão técnica: não implementar OAuth real às pressas. Para apresentação local, o botão simula uma sessão administrativa no `localStorage`.
* Controle de conta autorizada: feito de forma demonstrativa no front.
* Arquivos alterados: `frontend/login.html`, `frontend/login-auth.js`, `frontend/admin.html`, `frontend/admin-auth.js`, `frontend/produto-admin.js`.
* Como testar: abrir `login.html`, clicar em Entrar com Google e acessar o painel.
* Observações: servidor Python não transforma login em Google real; OAuth real exigiria configuração externa no Google Cloud.

## 5. Fluxo principal esperado

1. Cliente acessa o catálogo.
2. Cliente adiciona produto ao carrinho.
3. Produto aparece no carrinho com imagem, nome, quantidade e subtotal.
4. Cliente calcula frete por CEP.
5. Total é atualizado.
6. Cliente vai para checkout.
7. Cliente escolhe forma de pagamento.
8. Cliente confirma pedido.
9. WhatsApp abre com mensagem formatada.
10. Dono acessa área administrativa apenas se autorizado.
11. Dono cadastra produto com imagem.
12. Produto aparece no catálogo e no carrinho.

## 6. Arquivos importantes

* `frontend/carrinho.html`
* `frontend/checkout.html`
* `frontend/produto.html`
* `frontend/catalogo.html`
* `frontend/produto-admin.html`
* `frontend/login.html`
* `frontend/admin.html`
* `backend/src/controllers/cartController.js`
* `backend/src/utils/shippingCalculator.js`
* `backend/src/utils/whatsappMessage.js`
* `backend/src/controllers/productController.js`
* `backend/src/middlewares/uploadMiddleware.js`
* `backend/src/controllers/authController.js`

## 7. Decisões técnicas tomadas

* Frete: backend quando disponível, fallback local simples para apresentação.
* Checkout: geração local do link do WhatsApp para garantir funcionamento no navegador.
* Imagens: preservar caminho original e resolver no carrinho.
* Login: OAuth real ficou pendente para não criar integração mal feita; para apresentação foi usada simulação local.
* Cadastro de produto: salvo em `localStorage`, suficiente para demonstração sem hospedagem pública.

## 8. Pendências

* Testar manualmente o fluxo principal.
* Opcional pós-apresentação: trocar login simulado por OAuth real ou JWT do backend.
* Opcional pós-apresentação: trocar cadastro local por persistência real no PostgreSQL.

## 9. Último estado conhecido

* Data/horário aproximado: 2026-06-23, noite.
* Resumo curto: corrigidos carrinho/frete, checkout/WhatsApp, imagem do carrinho, login local demonstrativo e cadastro local de produto com imagem.
* Funcionando esperado: produto -> carrinho com imagem -> frete -> checkout -> WhatsApp; login -> painel -> cadastrar produto -> catálogo.
* Ainda falta: teste manual completo no navegador; OAuth real e persistência real ficam como melhorias futuras.
* Próximo passo recomendado: rodar servidor Python, limpar cache se necessário e testar o fluxo principal no navegador.

## 10. Persistência real de produtos no PostgreSQL

* Status: implementado no código; teste funcional completo depende do PostgreSQL/Docker estar rodando localmente.
* Objetivo da rodada: remover `localStorage.produtosYojo` como fonte de verdade dos produtos e usar backend + PostgreSQL.
* Backend ajustado:
  * `backend/src/controllers/productController.js` agora lista, busca por ID real, cria, edita e exclui produtos usando Sequelize/PostgreSQL.
  * Criada rota `GET /api/produtos/id/:id` para abrir `produto.html?id=ID_DO_BANCO` e editar `produto-admin.html?id=ID_DO_BANCO`.
  * `POST /api/produtos`, `PUT /api/produtos/:id` e `DELETE /api/produtos/:id` continuam protegidas por token.
  * Upload de imagem via `multer` continua salvando em `backend/uploads` e retorna `imagemUrl` apontando para `/uploads/...`.
  * Produtos seedados com imagens de `frontend/assets` passam a retornar `imagemUrl` compatível com o front local.
  * Modelo `Product` ganhou campo `status` para persistir estado visual/administrativo.
  * `server.js` passou a usar `sequelize.sync({ alter: true })` para ajustar a tabela local sem resetar dados.
  * `backend/src/config/database.js` passou a aceitar `DATABASE_URL` ou as variáveis separadas `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`.
* Autenticação local para apresentação:
  * `frontend/login-auth.js` não lê mais `backend/.env` pelo navegador.
  * Para apresentação local, o botão de login cria sessão com `demo-local-admin-token`.
  * `backend/src/middlewares/authMiddleware.js` aceita esse token apenas quando `NODE_ENV` não é `production`.
  * OAuth Google real segue fora de escopo desta etapa.
* Front ajustado:
  * `frontend/catalogo.html` carrega produtos de `GET /api/produtos` e não lê mais `localStorage.produtosYojo`.
  * `frontend/admin-produtos.js` lista produtos reais do banco, edita por ID real e exclui via API.
  * `frontend/produto-admin.js` cadastra e edita produto real com `FormData`, incluindo imagem quando selecionada.
  * `frontend/produto.html` busca produto real por ID, mostra imagem/nome/preço/descrição e adiciona ao carrinho preservando imagem e ID numérico real.
* Testes feitos:
  * Sintaxe verificada com `node --check` nos arquivos JS alterados do backend e frontend.
  * Corrigida conexão local com PostgreSQL: `backend/.env` deve usar `DB_HOST=127.0.0.1` e `DB_PORT=5433`, pois o Docker expõe o Postgres local na porta 5433.
  * `npm run seed:admin`, `npm run seed:categorias` e `npm run seed:produtos` executaram com sucesso após a correção do `.env`.

## 11. Autenticação Google restrita ao administrador

* Status: implementado no código.
* Problema encontrado: o login anterior entrava no admin com token local demonstrativo, sem obrigar validação real da conta Google.
* Correção feita:
  * O front voltou a usar Google Identity Services.
  * O front não lê mais `.env` e não cria mais token local demonstrativo.
  * O backend agora entrega apenas o Client ID público para inicializar o botão Google.
  * O backend valida a credencial Google, confere se o token pertence ao app configurado, confere se o email é verificado e bloqueia qualquer email diferente do email administrador configurado.
  * O middleware de autenticação não aceita mais o token local de demonstração.
  * O painel admin agora valida o JWT no backend antes de liberar a sessão.
* Arquivos alterados:
  * `backend/src/controllers/authController.js`
  * `backend/src/routes/authRoutes.js`
  * `backend/src/middlewares/authMiddleware.js`
  * `frontend/login-auth.js`
  * `frontend/admin-auth.js`
* Para testar:
  * Limpar o localStorage ou sair pelo botão `Sair`.
  * Entrar em `frontend/login.html`.
  * Escolher uma conta Google diferente da autorizada: deve bloquear.
  * Escolher a conta administradora configurada: deve entrar no painel.

* Como testar depois de subir o banco:
  * `cd backend`
  * `docker compose up -d postgres`
  * `npm install`
  * `npm run seed:admin`
  * `npm run seed:categorias`
  * `npm run seed:produtos`
  * `npm run dev`
  * Em outro terminal, na raiz do projeto: `python -m http.server 5500`
  * Abrir `http://127.0.0.1:5500/frontend/index.html`.

## 12. Polimento visual e ícones do projeto

* Status: implementado apenas em frontend estático; nenhuma rota, controller, banco, regra de negócio ou fluxo do backend foi alterado.
* Auditoria visual rápida:
  * Header e logo estavam um pouco grandes em várias páginas.
  * Havia repetição visual de estados de menu pouco refinados.
  * Alguns textos pequenos tinham letter-spacing alto demais.
  * Glows/radiais roxos davam aparência genérica e pouco intencional.
  * Cards, botões, imagens e estados de hover tinham densidade e acabamento diferentes entre páginas.
  * Alguns botões administrativos podiam quebrar linha ou ficar com ritmo visual inconsistente.
* Correções aplicadas:
  * Criado `frontend/css/visual-polish.css` como camada final de acabamento, carregada depois dos CSS originais.
  * O arquivo novo padroniza header, navegação, estados hover/selected, sombras, cards, botões, inputs, badges, imagens de produto e ajustes responsivos.
  * Os glows decorativos mais genéricos foram suavizados/removidos via override CSS.
  * As imagens de produto foram padronizadas com `object-fit: contain` e fundo neutro para evitar cortes estranhos.
  * Todos os HTMLs receberam o favicon e o CSS de polimento visual.
* Ícones criados:
  * `frontend/assets/favicon-yojo.svg`: favicon vetorial pequeno, baseado na paleta verde/creme/lilás do projeto.
  * `frontend/assets/google-cloud-project-icon.svg`: ícone quadrado vetorial em proporção 512x512 para usar no projeto do Google Cloud Console.
* Arquivos criados/alterados nesta rodada:
  * `frontend/assets/favicon-yojo.svg`
  * `frontend/assets/google-cloud-project-icon.svg`
  * `frontend/css/visual-polish.css`
  * Todos os HTMLs de `frontend/` para incluir favicon e CSS final.
* Observação: se o Google Cloud Console não aceitar SVG no upload, exportar `google-cloud-project-icon.svg` como PNG 512x512.
