# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_04_11_152204) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "biddings", force: :cascade do |t|
    t.string "tipo_documento"
    t.string "cod_municipio"
    t.datetime "data_autuacao"
    t.string "numero_processo"
    t.string "especie_processo"
    t.text "objeto"
    t.decimal "valor_estimado", precision: 15, scale: 2
    t.string "cpf_parecer_juridico"
    t.string "nome_parecer_juridico"
    t.string "cpf_gestor_unidade"
    t.datetime "data_portaria_comissao"
    t.string "sequencial_comissao"
    t.string "cpf_homologacao"
    t.string "nome_homologacao"
    t.datetime "data_homologacao"
    t.string "hora_realizacao"
    t.datetime "data_realizacao"
    t.string "modalidade"
    t.string "criterio_julgamento"
    t.decimal "valor_limite_superior", precision: 15, scale: 2
    t.text "justificativa_preco"
    t.text "motivo_escolha_fornecedor"
    t.text "fundamentacao_legal"
    t.string "orgao_gerenciador_ata"
    t.date "data_referencia"
    t.string "cpf_cotacao_precos"
    t.string "nome_cotacao_precos"
    t.string "cpf_elaborador_termo"
    t.string "nome_elaborador_termo"
    t.string "forma_contratacao"
    t.string "tipo_disputa"
    t.string "url_plataforma"
    t.string "sistema_registro_preco"
    t.string "id_contratacao_pncp"
    t.string "id_ata_pncp"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "contracts", force: :cascade do |t|
    t.string "tipo_documento"
    t.string "cod_municipio"
    t.string "cpf_gestor"
    t.string "numero_contrato"
    t.datetime "data_assinatura"
    t.string "tipo_objeto"
    t.string "modalidade"
    t.string "cpf_gestor_original"
    t.string "numero_contrato_original"
    t.datetime "data_contrato_original"
    t.datetime "vigencia_inicial"
    t.datetime "vigencia_final"
    t.text "objeto_contrato"
    t.decimal "valor", precision: 15, scale: 2
    t.datetime "data_inicio_obra"
    t.string "tipo_obra_servico"
    t.string "numero_obra"
    t.datetime "data_termino_obra"
    t.datetime "referencia"
    t.datetime "data_autuacao"
    t.string "numero_processo"
    t.string "cpf_fiscal"
    t.string "nome_fiscal"
    t.string "id_contrato_pncp"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end
end
