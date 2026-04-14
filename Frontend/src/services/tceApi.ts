import api from "./api";
import type { TceMunicipalityOption, TceQueryResult } from "../types/tce";

// Busca as definições (parâmetros) de um path específico
export async function fetchTceEndpointDefinitions(path: string) {
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  const response = await api.get(`/tce/definitions/${cleanPath}`);
  return response.data; // { summary, parameters: [] }
}

export async function fetchTceMunicipalities(): Promise<TceMunicipalityOption[]> {
  const response = await api.get("/tce/municipios");
  return response.data.data || [];
}

export async function queryTce(path: string, params: Record<string, any>): Promise<TceQueryResult> {
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  const response = await api.get(`/tce/${cleanPath}`, { params });
  return response.data;
}