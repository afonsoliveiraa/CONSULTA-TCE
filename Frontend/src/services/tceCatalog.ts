import tceSpec from "../../../Api/lib/tce_specs.json";
import type { TceEndpoint, TceEndpointField } from "../types/tce";

interface TceSpecPathOperation {
  summary?: string;
  tags?: string[];
  parameters?: Array<{
    name?: string;
    description?: string;
    required?: boolean;
    schema?: {
      type?: string;
    };
  }>;
}

interface TceSpecDocument {
  paths?: Record<string, { get?: TceSpecPathOperation }>;
}

export function buildLocalTceCatalog(): TceEndpoint[] {
  const spec = tceSpec as TceSpecDocument;
  const paths = spec.paths ?? {};

  return Object.entries(paths)
    .map(([path, definition]) => {
      const operation = definition.get;
      if (!operation) {
        return null;
      }

      const parameters = (operation.parameters ?? []).map<TceEndpointField>((parameter) => ({
        name: parameter.name ?? "",
        label: humanizeLabel(parameter.name ?? ""),
        description: parameter.description ?? "",
        type: parameter.schema?.type ?? "string",
        required: Boolean(parameter.required),
      }));

      return {
        key: path.replace(/^\//, ""),
        path,
        label: summarizeEndpointName(path.replace(/^\//, "")),
        category: operation.tags?.[0] ?? "",
        summary: operation.summary ?? "",
        parameters,
        required_parameters: parameters.filter((parameter) => parameter.required),
      } satisfies TceEndpoint;
    })
    .filter((endpoint): endpoint is TceEndpoint => endpoint !== null)
    .sort((left, right) => left.label.localeCompare(right.label, "pt-BR"));
}

export function summarizeEndpointName(endpointKey: string) {
  return endpointShortNames[endpointKey] ?? humanizeLabel(endpointKey);
}

const endpointShortNames: Record<string, string> = {
  agentes_publicos: "Agentes Públicos",
  bens_municipios: "Bens dos Municípios",
  contas_bancarias: "Contas Bancárias",
  contratados: "Contratados",
  contratos: "Contratos",
  desligamentos: "Desligamentos",
  empenhos: "Empenhos",
  funcoes: "Funções",
  gestores_unidades_gestoras: "Gestores",
  licitacoes: "Licitações",
  licitantes: "Licitantes",
  municipios: "Municípios",
  notas_empenhos: "Notas de Empenho",
  orgaos: "Órgãos",
  programas: "Programas",
  unidades_gestoras: "Unidades Gestoras",
};

function humanizeLabel(value: string) {
  return value
    .replace(/^\//, "")
    .replaceAll("_", " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
