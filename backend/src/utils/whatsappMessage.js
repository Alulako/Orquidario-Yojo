import { WHATSAPP_NUMBER } from "../config/whatsapp.js";

/**
 * Normalizes string removing accents and replacing special characters.
 * @param {string} str 
 * @returns {string}
 */
export function removeAccents(str) {
  if (typeof str !== "string") return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C");
}

/**
 * Generates formatted WhatsApp message and URI-encoded URL.
 * 
 * @param {object} payload 
 * @returns {{ whatsappUrl: string, mensagem: string }}
 */
export function generateWhatsappMessage(payload) {
  const { cliente, entrega, pagamento, itens, frete } = payload;

  const subtotal = itens.reduce((acc, item) => acc + (item.quantidade * item.precoUnitario), 0);
  const total = subtotal + Number(frete || 0);

  const formattedItens = itens.map(item => {
    const itemTotal = item.quantidade * item.precoUnitario;
    const formattedItemTotal = itemTotal.toFixed(2).replace(".", ",");
    return `- ${item.quantidade}x ${item.nome} - R$ ${formattedItemTotal}`;
  }).join("\n");

  const entregaMap = {
    retirada: "Retirada no local",
    entrega_combinar: "Entrega a combinar",
    entrega_regiao: "Entrega na regiao"
  };

  const pagamentoMap = {
    pix: "Pix",
    cartao: "Cartao",
    na_retirada: "Na retirada"
  };

  const entregaText = entregaMap[entrega] || entrega;
  const pagamentoText = pagamentoMap[pagamento] || pagamento;

  let formattedCep = cliente.cep;
  if (typeof formattedCep === "string") {
    const cleanCep = formattedCep.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      formattedCep = `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`;
    }
  }

  const lines = [
    "Ola, Orquidario Yojo! Gostaria de fazer um pedido:",
    "ITENS:",
    formattedItens,
    `Subtotal: R$ ${subtotal.toFixed(2).replace(".", ",")}`,
    `Frete: R$ ${Number(frete || 0).toFixed(2).replace(".", ",")}`,
    `TOTAL: R$ ${total.toFixed(2).replace(".", ",")}`,
    `ENTREGA: ${entregaText}`,
    `PAGAMENTO: ${pagamentoText}`,
    "DADOS:",
    `Nome: ${cliente.nome}`,
    `Telefone: ${cliente.telefone}`,
    `Endereco: ${cliente.endereco}`,
    `CEP: ${formattedCep}`
  ];

  if (cliente.observacoes) {
    lines.push(`Obs: ${cliente.observacoes}`);
  } else {
    // If empty/falsy, show the line without content or omit?
    // Let's check requirements. To be safe, let's include "Obs: " or omit it.
    // Let's include "Obs: " to show it is supported.
    lines.push(`Obs: `);
  }

  const rawMessage = lines.join("\n");
  const cleanedMessage = removeAccents(rawMessage);
  const encodedMessage = encodeURIComponent(cleanedMessage);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  return {
    whatsappUrl,
    mensagem: cleanedMessage
  };
}
