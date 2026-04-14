import api from "./api";
import type { TceEndpoint, TceMunicipalityOption, TceQueryResult } from "../types/tce";

export async function fetchTceEndpoints(): Promise<TceEndpoint[]> {
  const response = await api.get("/tce/endpoints");
  return response.data.endpoints || [];
}

export async function fetchTceMunicipalities(): Promise<TceMunicipalityOption[]> {
  const response = await api.get("/tce/municipios");
  return response.data.data || [];
}

export async function queryTce(path: string, params: Record<string, unknown>): Promise<TceQueryResult> {
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  const response = await api.get(`/tce/${cleanPath}`, { params });
  return response.data;
}
