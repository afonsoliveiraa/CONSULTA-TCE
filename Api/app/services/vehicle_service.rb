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

        # Retorno para o controller
        total_count
    end

    def import_vehicles(file)
        count = 0

        begin
            Contract.transaction do
                CSV.foreach(file.path, encoding: 'ISO-8859-1', col_sep: ',', quote_char: '"', skip_blanks: true) do |row|

                    if row.size == 22
                        map_row = map_layout_vm(row)
                    else
                        raise "Layout inválido: linha com #{row.size} colunas não suportado."
                    end

                    if !Vehicle.exists?(map_row)
                        vehicle = Vehicle.new(map_row)
                        vehicle.save!
                        count += 1
                    else
                        raise "Linha já existe: #{map_row}"
                    end
                end
            end
        rescue => e
            Rails.logger.error("Importação de contrato abortada [#{file.original_filename}]: #{e.message}")
            return 0       
        end
        # Retorno para o metodo de importar vários arquivos
        count

    end

    def map_layout_vm(row)
    {
        tipo_documento:                  row[0]&.strip.presence,
        cod_municipio:                   row[1]&.strip.presence,
        codigo_renavam:                  row[2]&.strip.presence,
        placa:                           row[3]&.strip.presence,
        chassi_vin:                      row[4]&.strip.presence,
        tipo_documento_proprietario:     row[5]&.strip.presence,
        documento_proprietario:          row[6]&.strip.presence,
        nome_razao_social_proprietario:  row[7]&.strip.presence,
        cidade_emplacamento:             row[8]&.strip.presence,
        uf_emplacamento:                 row[9]&.strip.presence,
        # Garantindo que campos integer não salvem strings vazias que quebram o banco
        ano_fabricacao:                  parse_integer(row[10]),
        ano_modelo:                      parse_integer(row[11]),
        marca:                           row[12]&.strip.presence,
        modelo_versao:                   row[13]&.strip.presence,
        cor_predominante:                row[14]&.strip.presence,
        tipo_combustivel:                row[15]&.strip.presence,
        tipo_veiculo:                    row[16]&.strip.presence,
        tipo_vinculacao:                 row[17]&.strip.presence,
        registro_tombo:                  row[18]&.strip.presence,
        situacao_veiculo:                row[19]&.strip.presence,
        odometro:                        parse_integer(row[20]),
        # O schema espera um DATE, o parse_ref deve retornar um objeto Date ou nil
        data_referencia_documentacao:    parse_ref(row[21])
    }
    end
    
    def parse_date(str)
        return nil if str.blank? || str.to_s.strip == "0"
        Date.strptime(str.to_s.strip, '%Y%m%d') rescue nil
    end

    def parse_ref(str)
        return nil if str.blank? || str.to_s.strip == "0"
        Date.strptime(str.to_s.strip, '%Y%m') rescue nil
    end

    def parse_decimal(str)
        return 0.0 if str.blank?
        str.to_s.gsub(',', '.').to_d rescue 0.0
    end

    def parse_integer(value)
        return nil if value.blank? || value.to_s.strip == "0"

        value.to_s.strip.to_i
    end
end