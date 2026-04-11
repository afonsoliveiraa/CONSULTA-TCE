import api from "./api";
import type { TceEndpoint, TceMunicipalityOption, TceQueryResult } from "../types/tce";

interface QueryPayload {
  municipalityCode: string;
  municipalityName: string;
  endpointKey: string;
  parameters: Record<string, string>;
  page: number;
  pageSize: number;
}

// Carrega o catalogo dos endpoints disponiveis para a tela.
export async function fetchTceEndpoints(): Promise<TceEndpoint[]> {
  const response = await api.get("/catalog/tce/endpoints");
  return response.data;
}

// Carrega os municipios usados no primeiro card da pagina.
export async function fetchTceMunicipalities(): Promise<TceMunicipalityOption[]> {
  const response = await api.get("/catalog/tce/municipios");
  return response.data;
}

// Envia ao backend a consulta dinamica escolhida pelo usuario.
export async function queryTce(payload: QueryPayload): Promise<TceQueryResult> {
  const response = await api.post("/tce/query", payload);
  return response.data;
}
