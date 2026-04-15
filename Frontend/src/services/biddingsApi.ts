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

export async function buscarLicitacoes(
  numeroProcesso?: string,
  codigoMunicipio?: string,
  page = 1,
): Promise<BiddingPagedResult> {
  try {
    // Unificado para a rota base
    const url = "/biddings";

    const response = await api.get(url, {
      params: {
        // Agora o número do processo vai como query param
        numero_processo: numeroProcesso?.trim() || undefined,
        codigo_municipio: codigoMunicipio?.trim() || undefined,
        // Mantendo o padrão de objeto para a paginação
        "page[page]": page,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, "Erro ao buscar licitações."));
  }
}

// services/biddingsApi.ts
export async function getMunicipiosLicitacoes(): Promise<string[]> {
  const response = await api.get("/biddings/municipios-importados");
  return response.data?.municipios ?? [];
}