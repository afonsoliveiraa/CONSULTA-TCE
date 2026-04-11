class CreateContracts < ActiveRecord::Migration[8.0]
  def change
    create_table :contracts do |t|
      t.string :tipo_documento
      t.string :cod_municipio
      t.string :cpf_gestor
      t.string :numero_contrato
      t.datetime :data_assinatura
      t.string :tipo_objeto
      t.string :modalidade
      t.string :cpf_gestor_original
      t.string :numero_contrato_original
      t.datetime :data_contrato_original
      t.datetime :vigencia_inicial
      t.datetime :vigencia_final
      t.text :objeto_contrato
      t.decimal :valor, precision: 15, scale: 2
      t.datetime :data_inicio_obra
      t.string :tipo_obra_servico
      t.string :numero_obra
      t.datetime :data_termino_obra
      t.datetime :referencia
      t.datetime :data_autuacao
      t.string :numero_processo
      t.string :cpf_fiscal
      t.string :nome_fiscal
      t.string :id_contrato_pncp

      t.timestamps
    end
  end
end
