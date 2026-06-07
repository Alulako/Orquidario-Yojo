import dotenv from "dotenv";
dotenv.config();

import sequelize from "../src/config/database.js";
// Mock sequelize database connection methods to run tests without DB running
sequelize.authenticate = async () => {
  console.log("[Mock] DB Authenticate Successful");
  return Promise.resolve();
};
sequelize.sync = async () => {
  console.log("[Mock] DB Sync Successful");
  return Promise.resolve();
};

import express from "express";
import routes from "../src/routes/index.js";

const app = express();
app.use(express.json());
app.use("/api", routes);

async function runTests() {
  // Start temporary test server
  const server = app.listen(3009, async () => {
    console.log("Test server listening on port 3009");
    
    try {
      // Test 1: POST /api/carrinho/frete success
      const resFrete1 = await fetch("http://localhost:3009/api/carrinho/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep: "01310100" })
      });
      console.log("Frete 1 status:", resFrete1.status);
      console.log("Frete 1 body:", await resFrete1.json());

      // Test 2: POST /api/carrinho/frete validation fail (short CEP)
      const resFreteFail = await fetch("http://localhost:3009/api/carrinho/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep: "123" })
      });
      console.log("Frete validation status (expect 400):", resFreteFail.status);
      console.log("Frete validation body:", await resFreteFail.json());

      // Test 3: POST /api/carrinho/finalizar success
      const resFinalizar = await fetch("http://localhost:3009/api/carrinho/finalizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: {
            nome: "Maria Silva",
            telefone: "11999999999",
            email: "maria@example.com",
            endereco: "Rua das Flores, 120 - São Paulo",
            cidade: "São Paulo",
            cep: "01310-100",
            observacoes: "Entregar pela manhã"
          },
          entrega: "retirada",
          pagamento: "pix",
          itens: [
            { produtoId: 1, nome: "Orquídea Phalaenopsis Branca", quantidade: 1, precoUnitario: 89.90 },
            { produtoId: 2, nome: "Adubo Líquido para Floração", quantidade: 2, precoUnitario: 24.90 }
          ],
          frete: 15.00
        })
      });
      console.log("Finalizar status:", resFinalizar.status);
      const dataFinalizar = await resFinalizar.json();
      console.log("Finalizar body:", dataFinalizar);
      
      // Test 4: POST /api/carrinho/finalizar validation fail (empty items)
      const resFinalizarFail = await fetch("http://localhost:3009/api/carrinho/finalizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: {
            nome: "Maria Silva",
            telefone: "11999999999",
            email: "maria@example.com",
            endereco: "Rua das Flores, 120 - São Paulo",
            cidade: "São Paulo",
            cep: "01310-100",
            observacoes: "Entregar pela manhã"
          },
          entrega: "retirada",
          pagamento: "pix",
          itens: [],
          frete: 15.00
        })
      });
      console.log("Finalizar validation status (expect 400):", resFinalizarFail.status);
      console.log("Finalizar validation body:", await resFinalizarFail.json());

    } catch (err) {
      console.error("Fetch request error:", err);
    } finally {
      server.close();
      console.log("Server closed. Tests complete.");
    }
  });
}

runTests();
