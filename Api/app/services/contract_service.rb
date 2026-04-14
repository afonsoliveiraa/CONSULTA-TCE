# app/services/contract_service.rb
require "csv"

class ContractService
  def self.import_multiple_files(files)
    new(files).import_multiple_files
  end

  def initialize(files)
    @files = Array(files)
  end

  def import_multiple_files
    total_count = 0

    @files.each do |file|
      total_count += import_contracts(file)
    end

    ImportResult.new(
      count: total_count,
      message: total_count.positive? ? "#{total_count} contratos importados com sucesso." : "Nenhum contrato importado.",
      duplicate: false
    )
  rescue DuplicateImportError => error
    ImportResult.new(count: 0, message: error.message, duplicate: true)
  rescue StandardError => error
    Rails.logger.error("Importacao de contrato abortada: #{error.message}")
    ImportResult.new(count: 0, message: "Nao foi possivel importar o arquivo de contratos.", duplicate: false)
  end

  def import_contracts(file)
    count = 0

    Contract.transaction do
      # A transacao garante rollback integral do arquivo se qualquer linha falhar.
      CSV.foreach(file.path, encoding: "ISO-8859-1", col_sep: ",", quote_char: "\"", skip_blanks: true) do |row|
        map_row = case row.size
                  when 18 then map_layout_2017_2018(row)
                  when 19 then map_layout_2019_2023(row)
                  when 24 then map_layout_2024_2025(row)
                  else
                    raise "Layout invalido: linha com #{row.size} colunas nao suportada."
                  end

        if Contract.exists?(map_row)
          raise DuplicateImportError, "Importacao de contrato abortada [#{file.original_filename}]: Linha ja existe."
        end

        Contract.create!(map_row)
        count += 1
      end

      count
    end
  rescue DuplicateImportError
    raise
  rescue StandardError => error
    Rails.logger.error("Importacao de contrato abortada [#{file.original_filename}]: #{error.message}")
    raise
  end

  private

  def map_layout_2017_2018(row)
    with_municipality(
      tipo_documento: row[0]&.strip.presence,
      cod_municipio: row[1]&.strip.presence,
      cpf_gestor: row[2]&.strip.presence,
      numero_contrato: row[3]&.strip.presence,
      data_assinatura: parse_date(row[4]),
      tipo_objeto: row[5]&.strip.presence,
      modalidade: row[6]&.strip.presence,
      numero_contrato_original: row[7]&.strip.presence,
      data_contrato_original: parse_date(row[8]),
      vigencia_inicial: parse_date(row[9]),
      vigencia_final: parse_date(row[10]),
      objeto_contrato: row[11]&.strip.presence,
      valor: parse_decimal(row[12]),
      data_inicio_obra: parse_date(row[13]),
      tipo_obra_servico: row[14]&.strip.presence,
      numero_obra: row[15]&.strip.presence,
      data_termino_obra: parse_date(row[16]),
      referencia: parse_ref(row[17])
    )
  end

  def map_layout_2019_2023(row)
    with_municipality(
      tipo_documento: row[0]&.strip.presence,
      cod_municipio: row[1]&.strip.presence,
      cpf_gestor: row[2]&.strip.presence,
      numero_contrato: row[3]&.strip.presence,
      data_assinatura: parse_date(row[4]),
      tipo_objeto: row[5]&.strip.presence,
      modalidade: row[6]&.strip.presence,
      cpf_gestor_original: row[7]&.strip.presence,
      numero_contrato_original: row[8]&.strip.presence,
      data_contrato_original: parse_date(row[9]),
      vigencia_inicial: parse_date(row[10]),
      vigencia_final: parse_date(row[11]),
      objeto_contrato: row[12]&.strip.presence,
      valor: parse_decimal(row[13]),
      data_inicio_obra: parse_date(row[14]),
      tipo_obra_servico: row[15]&.strip.presence,
      numero_obra: row[16]&.strip.presence,
      data_termino_obra: parse_date(row[17]),
      referencia: parse_ref(row[18])
    )
  end

  def map_layout_2024_2025(row)
    map_layout_2019_2023(row).merge(
      data_autuacao: parse_date(row[19]),
      numero_processo: row[20]&.strip.presence,
      cpf_fiscal: row[21]&.strip.presence,
      nome_fiscal: row[22]&.strip.presence,
      id_contrato_pncp: row[23]&.strip.presence
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
