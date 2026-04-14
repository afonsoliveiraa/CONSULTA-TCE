export type BiddingColumnId =
  | "tipo_documento"
  | "municipality_name"
  | "cod_municipio"
  | "data_autuacao"
  | "numero_processo"
  | "especie_processo"
  | "objeto"
  | "valor_estimado"
  | "cpf_parecer_juridico"
  | "nome_parecer_juridico"
  | "cpf_gestor_unidade"
  | "data_portaria_comissao"
  | "sequencial_comissao"
  | "cpf_homologacao"
  | "nome_homologacao"
  | "data_homologacao"
  | "hora_realizacao"
  | "data_realizacao"
  | "modalidade"
  | "criterio_julgamento"
  | "valor_limite_superior"
  | "justificativa_preco"
  | "motivo_escolha_fornecedor"
  | "fundamentacao_legal"
  | "orgao_gerenciador_ata"
  | "data_referencia"
  | "cpf_cotacao_precos"
  | "nome_cotacao_precos"
  | "cpf_elaborador_termo"
  | "nome_elaborador_termo"
  | "forma_contratacao"
  | "tipo_disputa"
  | "url_plataforma"
  | "sistema_registro_preco"
  | "id_contratacao_pncp"
  | "id_ata_pncp";

export interface BiddingColumnDefinition {
  id: BiddingColumnId;
  label: string;
  active: boolean;
}
