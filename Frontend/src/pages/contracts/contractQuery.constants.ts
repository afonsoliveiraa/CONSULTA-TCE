// frontend/src/pages/contracts/contractQuery.constants.ts

import type { ContratoColumnDefinition, ContratoFilters } from "./contractQuery.types";

/**
 * Define as colunas disponíveis na grade.
 * Os IDs agora batem exatamente com as chaves do JSON enviado pelo Rails (snake_case).
 */
export const contratoColumns: ContratoColumnDefinition[] = [
  { id: "tipo_documento", label: "Tipo Documento", active: true },
  { id: "cod_municipio", label: "Município", active: true },
  { id: "cpf_gestor", label: "CPF Gestor", active: true },
  { id: "numero_contrato", label: "Número", active: true },
  { id: "data_assinatura", label: "Data Assinatura", active: true },
  { id: "tipo_objeto", label: "Tipo Objeto", active: true },
  { id: "modalidade", label: "Modalidade", active: true },
  { id: "cpf_gestor_original", label: "CPF Gestor Original", active: false },
  { id: "numero_contrato_original", label: "Número Contrato Original", active: false },
  { id: "data_contrato_original", label: "Data Contrato Original", active: false },
  { id: "vigencia_inicial", label: "Vigência Inicial", active: true },
  { id: "vigencia_final", label: "Vigência Final", active: true },
  { id: "data_inicio_obra", label: "Data Início Obra", active: false },
  { id: "tipo_obra_servico", label: "Tipo Obra/Serviço", active: false },
  { id: "numero_obra", label: "Número Obra", active: false },
  { id: "data_termino_obra", label: "Data Término Obra", active: false },
  { id: "referencia", label: "Referência", active: true },
  { id: "data_autuacao", label: "Data Autuação", active: false },
  { id: "numero_processo", label: "Número Processo", active: false },
  { id: "valor", label: "Valor", active: true },
  { id: "objeto_contrato", label: "Objeto", active: true }, // Mapeado para o JSON do Rails
  { id: "cpf_fiscal", label: "CPF Fiscal", active: true },
  { id: "nome_fiscal", label: "Nome Fiscal", active: true },
  { id: "id_contrato_pncp", label: "Id Contrato PNCP", active: false },
];

/**
 * Mantém o formato padrão dos filtros locais da grade.
 * Importante: Se você usa esses filtros para busca local, 
 * as chaves devem ser iguais aos IDs acima.
 */
export const emptyFilters: ContratoFilters = {
  tipo_documento: "",
  cod_municipio: "",
  cpf_gestor: "",
  numero_contrato: "",
  data_assinatura: "",
  tipo_objeto: "",
  modalidade: "",
  cpf_gestor_original: "",
  numero_contrato_original: "",
  data_contrato_original: "",
  vigencia_inicial: "",
  vigencia_final: "",
  data_inicio_obra: "",
  tipo_obra_servico: "",
  numero_obra: "",
  data_termino_obra: "",
  referencia: "",
  data_autuacao: "",
  numero_processo: "",
  valor: "",
  objeto_contrato: "",
  cpf_fiscal: "",
  nome_fiscal: "",
  id_contrato_pncp: "",
};