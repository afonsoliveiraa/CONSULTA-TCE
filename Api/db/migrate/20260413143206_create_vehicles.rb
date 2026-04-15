class CreateVehicles < ActiveRecord::Migration[8.0]
  def change
    unless table_exists?(:vehicles)
      create_table :vehicles do |t|
        t.string :tipo_documento
        t.string :cod_municipio
        t.string :codigo_renavam
        t.string :placa
        t.string :chassi_vin
        t.string :tipo_documento_proprietario
        t.string :documento_proprietario
        t.string :nome_razao_social_proprietario
        t.string :cidade_emplacamento
        t.string :uf_emplacamento
        t.integer :ano_fabricacao
        t.integer :ano_modelo
        t.string :marca
        t.string :modelo_versao
        t.string :cor_predominante
        t.string :tipo_combustivel
        t.string :tipo_veiculo
        t.string :tipo_vinculacao
        t.string :registro_tombo
        t.string :situacao_veiculo
        t.integer :odometro
        t.date :data_referencia_documentacao

        t.timestamps
      end
    end

    add_index :vehicles, :codigo_renavam, if_not_exists: true
    add_index :vehicles, :placa, if_not_exists: true
    add_index :vehicles, :data_referencia_documentacao, if_not_exists: true
  end
end
