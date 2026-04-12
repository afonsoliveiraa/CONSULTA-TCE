// Representa o formato retornado pela API para consulta de veiculos.
export interface Vehicle {
  id: number;
  tipo_documento: string;
  cod_municipio: string;
  municipality_code?: string | null;
  municipality_name?: string | null;
  codigo_renavam: string;
  placa: string;
  chassi_vin: string;
  tipo_documento_proprietario: string;
  documento_proprietario: string;
  nome_razao_social_proprietario: string;
  cidade_emplacamento: string;
  uf_emplacamento: string;
  ano_fabricacao: number | null;
  ano_modelo: number | null;
  marca: string;
  modelo_versao: string;
  cor_predominante: string;
  tipo_combustivel: string;
  tipo_veiculo: string;
  tipo_vinculacao: string;
  registro_tombo: string;
  situacao_veiculo: string;
  odometro: number | null;
  data_referencia_documentacao: string | null;
}
