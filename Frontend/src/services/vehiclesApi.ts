// frontend/src/services/vehiclesApi.ts

import api from "./api"; 
import axios from "axios";
import type { Vehicle } from "../types/vehicle";

export interface VehiclePagedResult {
  data: Vehicle[];
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

// Função utilitária copiada do padrão de contracts para tratar erros da API
function extractApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;
    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

/**
 * Busca a lista de municípios que possuem veículos importados.
 * Usa a rota: GET /vehicles/municipios-importados
 */
export async function getMunicipiosVeiculos(): Promise<string[]> {
  try {
    const response = await api.get("/vehicles/municipios-importados");
    // O Rails retorna { municipios: [...] } conforme sua estrutura
    return response.data?.municipios ?? [];
  } catch (error) {
    throw new Error(
      extractApiErrorMessage(error, "Falha ao carregar a lista de municípios.")
    );
  }
}

/**
 * Realiza a consulta de veículos com filtros e paginação.
 * Usa a rota: GET /vehicles
 */
/**
 * Realiza a consulta de veículos com filtros e paginação.
 * Se houver placaOuRenavam, usa a rota específica.
 * Caso contrário, chama o index geral.
 */
// frontend/src/services/vehiclesApi.ts

// frontend/src/services/vehiclesApi.ts

export async function buscarVeiculos(
  placaOuRenavam?: string,
  codMunicipio?: string,
  page = 1,
): Promise<VehiclePagedResult> {
  try {
    const response = await api.get("/vehicles", {
      params: {
        placa_ou_renavam: placaOuRenavam?.trim() || undefined,
        cod_municipio: codMunicipio?.trim() || undefined,
        // Mantendo o padrão que funciona no Contracts
        "page[page]": page, 
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, "Erro ao buscar veículos."));
  }
}