import api from "./api";
import type { Bidding } from "../types/bidding";

export interface BiddingPagedResult {
  data: Bidding[];
  pagination: {
    count: number;
    page: number;
    last: number;
    next: number | null;
    prev: number | null;
    from: number;
    to: number;
  };
}

// Centraliza a consulta de licitacoes para manter o contrato do hook enxuto.
export async function buscarLicitacoes(
  numeroProcesso?: string,
  codigoMunicipio?: string,
  page = 1,
): Promise<BiddingPagedResult> {
  const url = numeroProcesso?.trim()
    ? `/biddings/numero/${encodeURIComponent(numeroProcesso.trim())}`
    : "/biddings";

  const response = await api.get(url, {
    params: {
      codigo_municipio: codigoMunicipio?.trim() || undefined,
      "page[page]": page,
    },
  });

  return response.data;
}

// services/biddingsApi.ts
export async function getMunicipiosLicitacoes(): Promise<string[]> {
  const response = await api.get("/biddings/municipios-importados");
  return response.data?.municipios ?? [];
}