/**
 * Calculates shipping fee based on CEP.
 * Rules:
 * - CEP starts with "01" or "02" -> R$ 15.00
 * - CEP starts with "1" -> R$ 20.00
 * - Other -> R$ 30.00
 * 
 * @param {string} cep
 * @returns {{ frete: number, freteFormatado: string }}
 */
export function calculateShipping(cep) {
  if (!cep) {
    throw new Error("CEP e obrigatorio");
  }

  const cleanCep = String(cep).replace(/\D/g, "");

  if (cleanCep.length !== 8) {
    throw new Error("CEP deve conter exatamente 8 digitos");
  }

  let frete = 30.00;
  if (cleanCep.startsWith("01") || cleanCep.startsWith("02")) {
    frete = 15.00;
  } else if (cleanCep.startsWith("1")) {
    frete = 20.00;
  }

  const freteFormatado = `R$ ${frete.toFixed(2).replace(".", ",")}`;

  return {
    frete,
    freteFormatado
  };
}
