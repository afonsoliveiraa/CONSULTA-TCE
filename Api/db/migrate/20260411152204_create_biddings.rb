class CreateBiddings < ActiveRecord::Migration[8.0]
  def change
    create_table :biddings do |t|
      t.string :tipo_documento
      t.string :cod_municipio
      t.datetime :data_autuacao
      t.string :numero_processo
      t.string :especie_processo
      t.text :objeto
      t.decimal :valor_estimado, precision: 15, scale: 2
      t.string :cpf_parecer_juridico
      t.string :nome_parecer_juridico
      t.string :cpf_gestor_unidade
      t.datetime :data_portaria_comissao
      t.string :sequencial_comissao
      t.string :cpf_homologacao
      t.string :nome_homologacao
      t.datetime :data_homologacao
      t.string :hora_realizacao
      t.datetime :data_realizacao
      t.string :modalidade
      t.string :criterio_julgamento
      t.decimal :valor_limite_superior, precision: 15, scale: 2
      t.text :justificativa_preco
      t.text :motivo_escolha_fornecedor
      t.text :fundamentacao_legal
      t.string :orgao_gerenciador_ata
      t.date :data_referencia
      t.string :cpf_cotacao_precos
      t.string :nome_cotacao_precos
      t.string :cpf_elaborador_termo
      t.string :nome_elaborador_termo
      t.string :forma_contratacao
      t.string :tipo_disputa
      t.string :url_plataforma
      t.string :sistema_registro_preco
      t.string :id_contratacao_pncp
      t.string :id_ata_pncp

      t.timestamps
    end
  end
end
