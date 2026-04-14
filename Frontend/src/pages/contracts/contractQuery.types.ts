export type ContratoColumnId =
  | "tipo_documento"
  | "municipality_name"
  | "cod_municipio"
  | "cpf_gestor"
  | "numero_contrato"
  | "data_assinatura"
  | "tipo_objeto"
  | "modalidade"
  | "cpf_gestor_original"
  | "numero_contrato_original"
  | "data_contrato_original"
  | "vigencia_inicial"
  | "vigencia_final"
  | "data_inicio_obra"
  | "tipo_obra_servico"
  | "numero_obra"
  | "data_termino_obra"
  | "referencia"
  | "data_autuacao"
  | "numero_processo"
  | "valor"
  | "objeto_contrato"
  | "cpf_fiscal"
  | "nome_fiscal"
  | "id_contrato_pncp";

export interface ContratoColumnDefinition {
  id: ContratoColumnId;
  label: string;
  active: boolean;
}

export interface ContratoFilters {
  tipo_documento: string;
  municipality_name: string;
  cod_municipio: string;
  cpf_gestor: string;
  numero_contrato: string;
  data_assinatura: string;
  tipo_objeto: string;
  modalidade: string;
  cpf_gestor_original: string;
  numero_contrato_original: string;
  data_contrato_original: string;
  vigencia_inicial: string;
  vigencia_final: string;
  data_inicio_obra: string;
  tipo_obra_servico: string;
  numero_obra: string;
  data_termino_obra: string;
  referencia: string;
  data_autuacao: string;
  numero_processo: string;
  valor: string;
  objeto_contrato: string;
  cpf_fiscal: string;
  nome_fiscal: string;
  id_contrato_pncp: string;
}
