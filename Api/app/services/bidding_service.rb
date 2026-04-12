# app/services/bidding_service.rb
require "csv"

class BiddingService
  def self.import_multiple_files(files)
    new(files).import_multiple_files
  end

  def initialize(files)
    @files = Array(files)
  end

  def import_multiple_files
    total_count = 0

    @files.each do |file|
      total_count += import_biddings(file)
    end

    ImportResult.new(
      count: total_count,
      message: total_count.positive? ? "#{total_count} licitacoes importadas com sucesso." : "Nenhuma licitacao importada.",
      duplicate: false
    )
  rescue DuplicateImportError => error
    ImportResult.new(count: 0, message: error.message, duplicate: true)
  rescue StandardError => error
    Rails.logger.error("Importacao de licitacao abortada: #{error.message}")
    ImportResult.new(count: 0, message: "Nao foi possivel importar o arquivo de licitacoes.", duplicate: false)
  end

  def import_biddings(file)
    count = 0

    Bidding.transaction do
      CSV.foreach(file.path, encoding: "ISO-8859-1", col_sep: ",", quote_char: "\"", skip_blanks: true) do |row|
        map_row = case row.size
                  when 25 then map_layout_2017_2023(row)
                  when 35 then map_layout_2024_2026(row)
                  else
                    raise "Layout invalido: linha com #{row.size} colunas nao suportada."
                  end

        if Bidding.exists?(map_row)
          raise DuplicateImportError, "Importacao de licitacao abortada [#{file.original_filename}]: Linha ja existe."
        end

        Bidding.create!(map_row)
        count += 1
      end

      count
    end
  rescue DuplicateImportError
    raise
  rescue StandardError => error
    Rails.logger.error("Importacao de licitacao abortada [#{file.original_filename}]: #{error.message}")
    raise
  end

  private

  def map_layout_2017_2023(row)
    with_municipality(
      tipo_documento: row[0]&.strip,
      cod_municipio: row[1]&.strip,
      data_autuacao: parse_date(row[2]),
      numero_processo: row[3]&.strip,
      especie_processo: row[4]&.strip,
      objeto: row[5]&.strip,
      valor_estimado: parse_decimal(row[6]),
      cpf_parecer_juridico: row[7]&.strip,
      nome_parecer_juridico: row[8]&.strip,
      cpf_gestor_unidade: row[9]&.strip,
      data_portaria_comissao: parse_date(row[10]),
      sequencial_comissao: row[11]&.strip,
      cpf_homologacao: row[12]&.strip,
      nome_homologacao: row[13]&.strip,
      data_homologacao: parse_date(row[14]),
      hora_realizacao: row[15]&.strip,
      data_realizacao: parse_date(row[16]),
      modalidade: row[17]&.strip,
      criterio_julgamento: row[18]&.strip,
      valor_limite_superior: parse_decimal(row[19]),
      justificativa_preco: row[20]&.strip,
      motivo_escolha_fornecedor: row[21]&.strip,
      fundamentacao_legal: row[22]&.strip,
      orgao_gerenciador_ata: row[23]&.strip,
      data_referencia: parse_ref(row[24]),
      cpf_cotacao_precos: nil,
      nome_cotacao_precos: nil,
      cpf_elaborador_termo: nil,
      nome_elaborador_termo: nil,
      forma_contratacao: nil,
      tipo_disputa: nil,
      url_plataforma: nil,
      sistema_registro_preco: nil,
      id_contratacao_pncp: nil,
      id_ata_pncp: nil
    )
  end

  def map_layout_2024_2026(row)
    with_municipality(
      tipo_documento: row[0]&.strip,
      cod_municipio: row[1]&.strip,
      data_autuacao: parse_date(row[2]),
      numero_processo: row[3]&.strip,
      especie_processo: row[4]&.strip,
      objeto: row[5]&.strip,
      valor_estimado: parse_decimal(row[6]),
      cpf_parecer_juridico: row[7]&.strip,
      nome_parecer_juridico: row[8]&.strip,
      cpf_gestor_unidade: row[9]&.strip,
      data_portaria_comissao: parse_date(row[10]),
      sequencial_comissao: row[11]&.strip,
      cpf_homologacao: row[12]&.strip,
      nome_homologacao: row[13]&.strip,
      data_homologacao: parse_date(row[14]),
      hora_realizacao: row[15]&.strip,
      data_realizacao: parse_date(row[16]),
      modalidade: row[17]&.strip,
      criterio_julgamento: row[18]&.strip,
      valor_limite_superior: parse_decimal(row[19]),
      justificativa_preco: row[20]&.strip,
      motivo_escolha_fornecedor: row[21]&.strip,
      fundamentacao_legal: row[22]&.strip,
      orgao_gerenciador_ata: row[23]&.strip,
      data_referencia: parse_ref(row[24]),
      cpf_cotacao_precos: row[25]&.strip,
      nome_cotacao_precos: row[26]&.strip,
      cpf_elaborador_termo: row[27]&.strip,
      nome_elaborador_termo: row[28]&.strip,
      forma_contratacao: row[29]&.strip,
      tipo_disputa: row[30]&.strip,
      url_plataforma: row[31]&.strip,
      sistema_registro_preco: row[32]&.strip,
      id_contratacao_pncp: row[33]&.strip,
      id_ata_pncp: row[34]&.strip
    )
  end

  def parse_date(str)
    return nil if str.blank? || str.to_s.strip == "0"

    Date.strptime(str.to_s.strip, "%Y%m%d") rescue nil
  end

  def parse_ref(str)
    return nil if str.blank? || str.to_s.strip == "0"

    Date.strptime(str.to_s.strip, "%Y%m") rescue nil
  end

  def parse_decimal(str)
    return 0.0 if str.blank?

    str.to_s.gsub(",", ".").to_d rescue 0.0
  end

  def with_municipality(attributes)
    municipality = MunicipalityLookupService.find_or_create_by_code(attributes[:cod_municipio])
    attributes.merge(municipality_id: municipality&.id)
  end
end
