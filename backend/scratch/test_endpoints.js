import { calculateShipping } from "../src/utils/shippingCalculator.js";
import { generateWhatsappMessage, removeAccents } from "../src/utils/whatsappMessage.js";

console.log("=== Testing Shipping Calculator ===");
try {
  console.log("01310100 (Expected 15):", calculateShipping("01310100"));
  console.log("02030-010 (Expected 15):", calculateShipping("02030-010"));
  console.log("13010000 (Expected 20):", calculateShipping("13010000"));
  console.log("90000000 (Expected 30):", calculateShipping("90000000"));
  
  // Test validation
  try {
    calculateShipping("1234");
  } catch (e) {
    console.log("Validation caught short CEP successfully:", e.message);
  }
} catch (error) {
  console.error("Shipping test failed:", error);
}

console.log("\n=== Testing WhatsApp Message Generator ===");
const testPayload = {
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
};

try {
  const result = generateWhatsappMessage(testPayload);
  console.log("Generated Message:\n---");
  console.log(result.mensagem);
  console.log("---\n");
  console.log("WhatsApp URL:\n", result.whatsappUrl);
  
  // Check for any remaining accents/special chars in message
  const hasAccents = /[\u00C0-\u00FF]/.test(result.mensagem);
  console.log("\nHas accents?", hasAccents);
} catch (error) {
  console.error("WhatsApp generator test failed:", error);
}
