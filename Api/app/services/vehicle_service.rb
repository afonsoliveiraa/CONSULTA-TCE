require "csv"

class VehicleService
  def self.import_multiple_files(files)
    new(files).import_multiple_files
  end

  def initialize(files)
    @files = Array(files)
  end

  def import_multiple_files
    total_count = 0

    @files.each do |file|
      total_count += import_vehicles(file)
    end

    ImportResult.new(
      count: total_count,
      message: total_count.positive? ? "#{total_count} veiculos importados com sucesso." : "Nenhum veiculo importado.",
      duplicate: false
    )
  rescue DuplicateImportError => error
    ImportResult.new(count: 0, message: error.message, duplicate: true)
  rescue StandardError => error
    Rails.logger.error("Importacao de veiculo abortada: #{error.message}")
    ImportResult.new(count: 0, message: "Nao foi possivel importar o arquivo de veiculos.", duplicate: false)
  end

  def import_vehicles(file)
    count = 0

    Vehicle.transaction do
      CSV.foreach(file.path, encoding: "ISO-8859-1", col_sep: ",", quote_char: "\"", skip_blanks: true) do |row|
        map_row = case row.size
                  when 22 then map_layout_vm(row)
                  else
                    raise "Layout invalido: linha com #{row.size} colunas nao suportada."
                  end

        if Vehicle.exists?(map_row)
          raise DuplicateImportError, "Importacao de veiculo abortada [#{file.original_filename}]: Linha ja existe."
        end

        Vehicle.create!(map_row)
        count += 1
      end

      count
    end
  rescue DuplicateImportError
    raise
  rescue StandardError => error
    Rails.logger.error("Importacao de veiculo abortada [#{file.original_filename}]: #{error.message}")
    raise
  end

  private

  def map_layout_vm(row)
    with_municipality(
      tipo_documento: row[0]&.strip.presence,
      cod_municipio: row[1]&.strip.presence,
      codigo_renavam: row[2]&.strip.presence,
      placa: row[3]&.strip.presence,
      chassi_vin: row[4]&.strip.presence,
      tipo_documento_proprietario: row[5]&.strip.presence,
      documento_proprietario: row[6]&.strip.presence,
      nome_razao_social_proprietario: row[7]&.strip.presence,
      cidade_emplacamento: row[8]&.strip.presence,
      uf_emplacamento: row[9]&.strip.presence,
      ano_fabricacao: parse_integer(row[10]),
      ano_modelo: parse_integer(row[11]),
      marca: row[12]&.strip.presence,
      modelo_versao: row[13]&.strip.presence,
      cor_predominante: row[14]&.strip.presence,
      tipo_combustivel: row[15]&.strip.presence,
      tipo_veiculo: row[16]&.strip.presence,
      tipo_vinculacao: row[17]&.strip.presence,
      registro_tombo: row[18]&.strip.presence,
      situacao_veiculo: row[19]&.strip.presence,
      odometro: parse_integer(row[20]),
      data_referencia_documentacao: parse_ref(row[21])
    )
  end

  def parse_integer(value)
    return nil if value.blank? || value.to_s.strip == "0"

    value.to_s.strip.to_i
  end

  def parse_ref(value)
    return nil if value.blank? || value.to_s.strip == "0"

    Date.strptime(value.to_s.strip, "%Y%m") rescue nil
  end

  def with_municipality(attributes)
    municipality = MunicipalityLookupService.find_or_create_by_code(attributes[:cod_municipio])
    attributes.merge(municipality_id: municipality&.id)
  end
end
