// Representa o formato retornado pela API para consulta de contratos.
export interface Contrato {
  id: number;
  tipo_documento: string;
  cod_municipio: string;
  municipality_code?: string | null;
  municipality_name?: string | null;
  cpf_gestor: string;
  numero_contrato: string;
  data_assinatura: string | null;
  tipo_objeto: string;
  modalidade: string;
  cpf_gestor_original: string;
  numero_contrato_original: string;
  data_contrato_original: string | null;
  vigencia_inicial: string | null;
  vigencia_final: string | null;
  objeto_contrato: string;
  valor: number | null;
  data_inicio_obra: string | null;
  tipo_obra_servico: string;
  numero_obra: string;
  data_termino_obra: string | null;
  referencia: string | null;
  data_autuacao: string | null;
  numero_processo: string;
  cpf_fiscal: string;
  nome_fiscal: string;
  id_contrato_pncp: string;
}
