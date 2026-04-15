import api from "./api";
import { ceMunicipalities } from "./ceMunicipalities";
import { buildLocalTceCatalog, summarizeEndpointName } from "./tceCatalog";
import type { TceEndpoint, TceMunicipalityOption, TceQueryResult } from "../types/tce";

export async function fetchTceEndpoints(): Promise<TceEndpoint[]> {
  try {
    const response = await api.get("/tce/endpoints");
    const endpoints = normalizeEndpoints(response.data.endpoints || []);
    return endpoints.length ? endpoints : buildLocalTceCatalog();
  } catch {
    return buildLocalTceCatalog();
  }
}

export async function fetchTceMunicipalities(): Promise<TceMunicipalityOption[]> {
  try {
    const response = await api.get("/tce/municipios");
    const municipalities = normalizeMunicipalities(response.data.data || []);
    return municipalities.length ? municipalities : ceMunicipalities;
  } catch {
    return ceMunicipalities;
  }
}

export async function queryTce(path: string, params: Record<string, unknown>): Promise<TceQueryResult> {
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  const response = await api.get(`/tce/${cleanPath}`, { params });
  return response.data;
}

function normalizeEndpoints(endpoints: TceEndpoint[]): TceEndpoint[] {
  return endpoints
    .map((endpoint) => ({
      ...endpoint,
      label: summarizeEndpointName(endpoint.key),
    }))
    .sort((left, right) => left.label.localeCompare(right.label, "pt-BR"));
}

function normalizeMunicipalities(municipalities: TceMunicipalityOption[]): TceMunicipalityOption[] {
  const municipalityNamesByIbgeCode = new Map(
    ceMunicipalities.map((municipality) => [municipality.codigo_municipio, municipality.nome_municipio]),
  );

  return municipalities
    .filter((municipality) => municipality?.codigo_municipio)
    .map((municipality) => ({
      ...municipality,
      nome_municipio:
        municipalityNamesByIbgeCode.get(municipality.geoibgeId ?? "") ||
        municipality.nome_municipio?.trim() ||
        municipality.codigo_municipio,
    }))
    .sort((left, right) => left.nome_municipio.localeCompare(right.nome_municipio, "pt-BR"));
}
