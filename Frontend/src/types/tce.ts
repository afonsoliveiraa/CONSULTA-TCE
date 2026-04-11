// Campo individual retornado pelo catalogo do backend para montar o formulario dinamico.
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

// Endpoint exibido no seletor da tela "API TCE".
export interface TceEndpoint {
  key: string;
  path: string;
  category: string;
  description: string;
  requiredFields: TceEndpointField[];
  optionalFields: TceEndpointField[];
}

// Opcao exibida no seletor de municipios.
export interface TceMunicipalityOption {
  code: string;
  name: string;
}

// Bloco de paginacao devolvido pela API interna.
export interface TceQueryPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasMorePages: boolean;
}

// Resultado generico da consulta para qualquer endpoint do TCE-CE.
export interface TceQueryResult {
  endpointKey: string;
  endpointPath: string;
  municipalityCode: string;
  municipalityName: string;
  sourceUrl: string;
  columns: string[];
  items: Record<string, string>[];
  metadata: Record<string, string>;
  pagination: TceQueryPagination;
}
