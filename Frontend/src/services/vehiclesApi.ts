import api from "./api";
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

// Centraliza a consulta de veiculos no mesmo contrato usado por contratos e licitacoes.
export async function buscarVeiculos(
  placaOuRenavam?: string,
  codMunicipio?: string,
  page = 1,
): Promise<VehiclePagedResult> {
  const response = await api.get("/vehicles", {
    params: {
      cod_municipio: codMunicipio?.trim() || undefined,
      placa_ou_renavam: placaOuRenavam?.trim() || undefined,
      "page[page]": page,
    },
  });

  return response.data;
}
