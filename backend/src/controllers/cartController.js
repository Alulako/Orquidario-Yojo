import { calculateShipping } from "../utils/shippingCalculator.js";
import { generateWhatsappMessage } from "../utils/whatsappMessage.js";

/**
 * Endpoint for calculating shipping fee.
 * POST /api/carrinho/frete
 */
export const calcularFrete = async (req, res) => {
  try {
    const { cep } = req.body;
    if (!cep) {
      return res.status(400).json({ error: "CEP e obrigatorio" });
    }

    // Clean CEP to check digits
    const cleanCep = String(cep).replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      return res.status(400).json({ error: "CEP deve conter exatamente 8 digitos" });
    }

    const shippingResult = calculateShipping(cleanCep);
    return res.json(shippingResult);
  } catch (error) {
    return res.status(400).json({ error: error.message || "Erro ao calcular frete" });
  }
};

/**
 * Endpoint for finalizing order and generating WhatsApp URL.
 * POST /api/carrinho/finalizar
 */
export const finalizarPedido = async (req, res) => {
  try {
    const { cliente, entrega, pagamento, itens, frete } = req.body;

    // Validate main structures
    if (!cliente) {
      return res.status(400).json({ error: "Dados do cliente sao obrigatorios" });
    }
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ error: "O carrinho de itens nao pode estar vazio" });
    }
    if (!entrega) {
      return res.status(400).json({ error: "Dados de entrega sao obrigatorios" });
    }
    if (!pagamento) {
      return res.status(400).json({ error: "Dados de pagamento sao obrigatorios" });
    }

    // Validate client details
    const requiredClientFields = ["nome", "telefone", "email", "endereco", "cidade", "cep"];
    for (const field of requiredClientFields) {
      if (!cliente[field]) {
        return res.status(400).json({ error: `O campo cliente.${field} e obrigatorio` });
      }
    }

    // Validate client CEP
    const cleanCep = String(cliente.cep).replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      return res.status(400).json({ error: "CEP do cliente deve conter exatamente 8 digitos" });
    }

    // Validate itens structure
    for (const item of itens) {
      if (!item.nome || !item.quantidade || !item.precoUnitario) {
        return res.status(400).json({ error: "Cada item deve ter nome, quantidade e precoUnitario" });
      }
    }

    const { whatsappUrl, mensagem } = generateWhatsappMessage({
      cliente,
      entrega,
      pagamento,
      itens,
      frete
    });

    return res.json({
      whatsappUrl,
      mensagem
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Erro interno ao finalizar pedido" });
  }
};