import type { TceEndpoint } from "../../types/tce";

const endpointFriendlyNames: Record<string, string> = {
  municipios: "Municipios",
  unidades_gestoras: "Unidades gestoras",
  dados_orcamentos: "Orcamento municipal",
  contas_bancarias: "Contas bancarias",
  orgaos: "Orgaos municipais",
  programas: "Programas de governo",
  licitacoes: "Licitacoes",
  licitantes: "Participantes de licitacoes",
  contratados: "Contratados",
  contrato: "Contratos",
  notas_empenhos: "Notas de empenho",
  agentes_publicos: "Agentes publicos",
};

const columnFriendlyNames: Record<string, string> = {
  codigo_municipio: "Codigo do municipio",
  nome_municipio: "Municipio",
  geoibgeid: "Codigo IBGE",
  geonamesid: "Codigo GeoNames",
  exercicio_orcamento: "Ano de referencia",
  codigo_orgao: "Orgao",
  nome_orgao: "Orgao",
  codigo_unidade: "Unidade",
  nome_unidade: "Unidade",
  numero_contrato: "Numero do contrato",
  tipo_contrato: "Tipo de contrato",
  modalidade_contrato: "Modalidade do contrato",
  data_contrato: "Data do contrato",
  data_realizacao_autuacao_licitacao: "Data da licitacao",
  data_realizacao_licitacao: "Data da licitacao",
  numero_licitacao: "Numero da licitacao",
  modalidade_licitacao: "Modalidade da licitacao",
  tp_licitacao_li: "Tipo da licitacao",
  modalidade_processo_administrativo: "Modalidade do processo",
  nome_negociante: "Nome do fornecedor",
  numero_documento_negociante: "Documento do fornecedor",
  valor_total_fixado_orcamento: "Valor total do orcamento",
  nu_lei_orcamento: "Numero da lei orcamentaria",
  data_envio_loa: "Data de envio da LOA",
  data_aprov_loa: "Data de aprovacao da LOA",
  data_public_loa: "Data de publicacao da LOA",
  numero_banco: "Banco",
  numero_agencia: "Agencia",
  data_referencia: "Data de referencia",
  codigo_programa: "Programa",
  nome_programa: "Programa",
  numero_empenho: "Numero do empenho",
  data_emissao_empenho: "Data de emissao do empenho",
  data_referencia_empenho: "Data de referencia",
  nome_servidor: "Nome do servidor",
  situacao_funcional: "Situacao funcional",
  codigo_ingresso: "Tipo de ingresso",
  data_referencia_agente_publico: "Data de referencia",
  data_inicio_vigencia_contrato: "Inicio da vigencia",
  data_fim_vigencia_contrato: "Fim da vigencia",
  descricao_objeto_contrato: "Objeto do contrato",
  valor_total_contrato: "Valor do contrato",
  data_contrato_original: "Data do contrato original",
  numero_contrato_original: "Numero do contrato original",
};

export function formatEndpointName(endpoint: TceEndpoint): string {
  return endpointFriendlyNames[endpoint.key] ?? humanizeToken(endpoint.key);
}

export function formatColumnLabel(columnName: string): string {
  const normalizedName = columnName.trim().toLowerCase();

  if (columnFriendlyNames[normalizedName]) {
    return columnFriendlyNames[normalizedName];
  }

  if (normalizedName.includes("data")) {
    return humanizeToken(columnName).replace(/^Data /, "Data de ");
  }

  if (normalizedName.startsWith("nome_")) {
    return humanizeToken(columnName).replace(/^Nome /, "");
  }

  if (normalizedName.startsWith("codigo_")) {
    return humanizeToken(columnName).replace(/^Codigo /, "");
  }

  if (normalizedName.startsWith("numero_")) {
    return humanizeToken(columnName).replace(/^Numero /, "Numero do ");
  }

  if (normalizedName.startsWith("valor_")) {
    return humanizeToken(columnName).replace(/^Valor /, "Valor do ");
  }

  return humanizeToken(columnName);
}

export function formatTceValue(columnName: string, value: string | null | undefined): string {
  if (value == null) {
    return "";
  }

  const normalizedColumn = columnName.trim().toLowerCase();
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return "";
  }

  if (isYearMonthDate(normalizedValue)) {
    return formatBrazilianMonthYear(normalizedValue);
  }

  if (isCompactDate(normalizedValue)) {
    return formatCompactDate(normalizedValue);
  }

  if (isDateColumn(normalizedColumn) || looksLikeIsoDate(normalizedValue)) {
    return formatBrazilianDate(normalizedValue);
  }

  if (isCurrencyColumn(normalizedColumn)) {
    return formatBrazilianCurrency(normalizedValue);
  }

  if (isDecimalNumber(normalizedValue)) {
    return formatBrazilianNumber(normalizedValue);
  }

  return normalizedValue;
}

function isDateColumn(columnName: string): boolean {
  return columnName.includes("data") || columnName.includes("vigencia") || columnName.includes("referencia");
}

function isCurrencyColumn(columnName: string): boolean {
  return columnName.includes("valor");
}

function looksLikeIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(?:[tT ]\d{2}:\d{2}:\d{2})?/.test(value);
}

function isYearMonthDate(value: string): boolean {
  return /^\d{6}$/.test(value);
}

function isCompactDate(value: string): boolean {
  return /^\d{8}$/.test(value);
}

function isDecimalNumber(value: string): boolean {
  return /^-?\d+(?:[.,]\d+)?$/.test(value);
}

function formatBrazilianDate(value: string): string {
  const datePortion = value.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePortion);

  if (!match) {
    return value;
  }

  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

function formatCompactDate(value: string): string {
  return `${value.slice(6, 8)}/${value.slice(4, 6)}/${value.slice(0, 4)}`;
}

function formatBrazilianMonthYear(value: string): string {
  return `${value.slice(4, 6)}/${value.slice(0, 4)}`;
}

function formatBrazilianCurrency(value: string): string {
  const parsedValue = Number.parseFloat(value.replace(",", "."));
  if (Number.isNaN(parsedValue)) {
    return value;
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parsedValue);
}

function formatBrazilianNumber(value: string): string {
  const parsedValue = Number.parseFloat(value.replace(",", "."));
  if (Number.isNaN(parsedValue)) {
    return value;
  }

  return new Intl.NumberFormat("pt-BR").format(parsedValue);
}

function humanizeToken(value: string): string {
  return value
    .replaceAll("geoibgeId", "codigo ibge")
    .replaceAll("geonamesId", "codigo geonames")
    .replaceAll("_", " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const normalizedWord = word.toLowerCase();
      if (normalizedWord === "cpf" || normalizedWord === "cnpj" || normalizedWord === "ibge" || normalizedWord === "loa") {
        return normalizedWord.toUpperCase();
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
