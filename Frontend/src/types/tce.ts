export interface TceEndpointField {
  name: string;
  label: string;
  description: string;
  type: string;
  required: boolean;
}

export interface TceEndpoint {
  key: string;
  path: string;
  label: string;
  category: string;
  summary: string;
  parameters: TceEndpointField[];
  required_parameters: TceEndpointField[];
}

export interface TceColumnDefinition {
  id: string;
  label: string;
  active?: boolean;
}

export interface TceMunicipalityOption {
  codigo_municipio: string;
  nome_municipio: string;
  geoibgeId?: string | null;
  geonamesId?: string | null;
}

export interface TceQueryResult {
  endpoint: string;
  source_url: string;
  data: Record<string, unknown>[];
  metadata: Record<string, unknown>;
}
