import type { Bidding } from "../../types/bidding";

const dateFields = new Set([
  "data_autuacao",
  "data_portaria_comissao",
  "data_homologacao",
  "data_realizacao",
  "data_referencia",
]);

function formatBrazilianDate(value: unknown) {
  if (!value) return "-";

  const stringValue = String(value);
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(stringValue);

  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }

  return stringValue;
}

export function formatBiddingValue(bidding: Bidding, field: string) {
  if (field === "municipality_name") {
    return bidding.municipality_name || bidding.cod_municipio || "-";
  }

  const value = (bidding as Record<string, unknown>)[field];

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (dateFields.has(field)) {
    return formatBrazilianDate(value);
  }

  if (field === "valor_estimado" || field === "valor_limite_superior") {
    const numberValue = Number(value);

    return Number.isNaN(numberValue)
      ? String(value)
      : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(numberValue);
  }

  return String(value);
}
