import type { Contrato } from "../../types/contrato";
import type { ContratoColumnId } from "./contractQuery.types";

// Lista de campos que devem ser formatados como data brasileira
const dateFields = new Set([
  "data_assinatura",
  "data_contrato_original",
  "vigencia_inicial",
  "vigencia_final",
  "data_inicio_obra",
  "data_termino_obra",
  "referencia",
  "data_autuacao",
]);

function formatBrazilianDate(value: any) {
  if (!value) return "-";
  const strValue = String(value);
  
  // Tenta extrair AAAA-MM-DD
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(strValue);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }
  return strValue;
}

export function formatContratoValue(contrato: Contrato, field: string) {
  const value = (contrato as any)[field];

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  // Se for campo de data
  if (dateFields.has(field)) {
    return formatBrazilianDate(value);
  }

  // Se for campo de valor
  if (field === "valor") {
    const num = Number(value);
    return isNaN(num) 
      ? value 
      : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
  }

  return String(value);
}