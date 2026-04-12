export type VehicleColumnId =
  | "tipo_documento"
  | "municipality_name"
  | "cod_municipio"
  | "codigo_renavam"
  | "placa"
  | "chassi_vin"
  | "tipo_documento_proprietario"
  | "documento_proprietario"
  | "nome_razao_social_proprietario"
  | "cidade_emplacamento"
  | "uf_emplacamento"
  | "ano_fabricacao"
  | "ano_modelo"
  | "marca"
  | "modelo_versao"
  | "cor_predominante"
  | "tipo_combustivel"
  | "tipo_veiculo"
  | "tipo_vinculacao"
  | "registro_tombo"
  | "situacao_veiculo"
  | "odometro"
  | "data_referencia_documentacao";

export interface VehicleColumnDefinition {
  id: VehicleColumnId;
  label: string;
  active: boolean;
}
