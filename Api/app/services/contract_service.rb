# app/services/contract_service.rb
require 'csv'

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

    total_count
  end

  def import_contracts(file) 
    count = 0
    
    # Begin/Transaction garante que se houver um erro em qualquer linha, nenhuma linha do arquivo será importada, mantendo a integridade dos dados.
    begin
      Contract.transaction do
        CSV.foreach(file.path, encoding: 'ISO-8859-1', col_sep: ',', quote_char: '"', skip_blanks: true) do |row|
          map_row = case row.size
                    when 18 then map_layout_2017_2018(row)
                    when 19 then map_layout_2019_2023(row)
                    when 24 then map_layout_2024_2025(row)
                    else
                      raise "Layout inválido: linha com #{map_row} layout não suportado."
                    end
          
          if !Contract.exists?(map_row)
            contract = Contract.new(map_row)
            contract.save!
            count += 1
          else
            raise "Linha já existe: #{map_row}"
          end

        end
        count
      end
    # rescue captura qualquer erro que ocorra durante a importação, seja por layout inválido, dados duplicados ou erros de validação, e registra o erro no log do Rails. Retorna 0 para indicar que nenhum contrato foi importado devido ao erro.
    rescue => e
      Rails.logger.error("Importação de contrato abortada [#{file.original_filename}]: #{e.message}")
      return 0
    end
  end

  private

  def map_layout_2017_2018(row)
    {
      tipo_documento:            row[0]&.strip.presence,
      cod_municipio:             row[1]&.strip.presence,
      cpf_gestor:                row[2]&.strip.presence,
      numero_contrato:           row[3]&.strip.presence,
      data_assinatura:           parse_date(row[4]),
      tipo_objeto:               row[5]&.strip.presence,
      modalidade:                row[6]&.strip.presence,
      numero_contrato_original:  row[7]&.strip.presence,
      data_contrato_original:    parse_date(row[8]),
      vigencia_inicial:          parse_date(row[9]),
      vigencia_final:            parse_date(row[10]),
      objeto_contrato:           row[11]&.strip.presence,
      valor:                     parse_decimal(row[12]),
      data_inicio_obra:          parse_date(row[13]),
      tipo_obra_servico:         row[14]&.strip.presence,
      numero_obra:               row[15]&.strip.presence,
      data_termino_obra:         parse_date(row[16]),
      referencia:                parse_ref(row[17])
    }
  end

  def map_layout_2019_2023(row)
    {
      tipo_documento:            row[0]&.strip.presence,
      cod_municipio:             row[1]&.strip.presence,
      cpf_gestor:                row[2]&.strip.presence,
      numero_contrato:           row[3]&.strip.presence,
      data_assinatura:           parse_date(row[4]),
      tipo_objeto:               row[5]&.strip.presence,
      modalidade:                row[6]&.strip.presence,
      cpf_gestor_original:       row[7]&.strip.presence,
      numero_contrato_original:  row[8]&.strip.presence,
      data_contrato_original:    parse_date(row[9]),
      vigencia_inicial:          parse_date(row[10]),
      vigencia_final:            parse_date(row[11]),
      objeto_contrato:           row[12]&.strip.presence,
      valor:                     parse_decimal(row[13]),
      data_inicio_obra:          parse_date(row[14]),
      tipo_obra_servico:         row[15]&.strip.presence,
      numero_obra:               row[16]&.strip.presence,
      data_termino_obra:         parse_date(row[17]),
      referencia:                parse_ref(row[18])
    }
  end

  def map_layout_2024_2025(row)
    data = map_layout_2019_2023(row)
    data.merge({
      data_autuacao:             parse_date(row[19]),
      numero_processo:           row[20]&.strip.presence,
      cpf_fiscal:                row[21]&.strip.presence,
      nome_fiscal:               row[22]&.strip.presence,
      id_contrato_pncp:          row[23]&.strip.presence
    })
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
end