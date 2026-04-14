export interface TceEndpointField {
  name: string;
  label: string;
  description: string;
  type: string;
  required: boolean;
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

export interface TceQueryPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasMorePages: boolean;
}

export interface TceQueryResult {
  endpointKey: string;
  endpointPath: string;
  municipalityCode: string;
  municipalityName: string;
  sourceUrl: string;
  columns: string[];
  items: Record<string, any>[];
  metadata: Record<string, string>;
  pagination: TceQueryPagination;
}