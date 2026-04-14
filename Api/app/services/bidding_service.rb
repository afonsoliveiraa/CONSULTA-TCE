# app/services/bidding_service.rb
require 'csv'

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
    total_count
  end

  def import_biddings(file)
    count = 0
    
    # Begin/Transaction garante que se houver um erro em qualquer linha, nenhuma linha do arquivo será importada, mantendo a integridade dos dados.
    begin
      Bidding.transaction do
        CSV.foreach(file.path, encoding: 'ISO-8859-1', col_sep: ',', quote_char: '"', skip_blanks: true) do |row|
          
          # Seleciona o layout baseado no número de colunas
          map_row = case row.size
                    when 25 then map_layout_2017_2023(row)
                    when 35 then map_layout_2024_2026(row)
                    else
                      raise "Layout inválido: linha com #{row.size} colunas não suportada."
                    end
          
          if !Bidding.exists?(map_row)
            bidding = Bidding.new(map_row)
            # save! dispara exceção e força o rollback total do arquivo se houver erro
            bidding.save!
            count += 1
          else
            raise "Linha já existe: #{map_row}" 
          end
        end
        count
      end
    # rescue captura qualquer erro que ocorra durante a importação, seja por layout inválido, dados duplicados ou erros de validação, e registra o erro no log do Rails. Retorna 0 para indicar que nenhum registro foi importado devido ao erro.
    rescue => e
      Rails.logger.error("Importação de licitação abortada [#{file.original_filename}]: #{e.message}")
      return 0
    end
  end

  private

  def map_layout_2017_2023(row)
    {
      tipo_documento:             row[0]&.strip.presence,
      cod_municipio:              row[1]&.strip.presence,
      data_autuacao:              parse_date(row[2]),
      numero_processo:            row[3]&.strip.presence,
      especie_processo:           row[4]&.strip.presence,
      objeto:                     row[5]&.strip.presence,
      valor_estimado:             parse_decimal(row[6]),
      cpf_parecer_juridico:       row[7]&.strip.presence,
      nome_parecer_juridico:      row[8]&.strip.presence,
      cpf_gestor_unidade:         row[9]&.strip.presence,
      data_portaria_comissao:     parse_date(row[10]),
      sequencial_comissao:        row[11]&.strip.presence,
      cpf_homologacao:            row[12]&.strip.presence,
      nome_homologacao:           row[13]&.strip.presence,
      data_homologacao:           parse_date(row[14]),
      hora_realizacao:            row[15]&.strip.presence,
      data_realizacao:            parse_date(row[16]),
      modalidade:                 row[17]&.strip.presence,
      criterio_julgamento:        row[18]&.strip.presence,
      valor_limite_superior:      parse_decimal(row[19]),
      justificativa_preco:        row[20]&.strip.presence,
      motivo_escolha_fornecedor:  row[21]&.strip.presence,
      fundamentacao_legal:        row[22]&.strip.presence,
      orgao_gerenciador_ata:      row[23]&.strip.presence,
      data_referencia:            parse_ref(row[24])
    }
  end

  def map_layout_2024_2026(row)
    data = map_layout_2017_2023(row)
    data.merge({
      cpf_cotacao_precos:         row[25]&.strip.presence,
      nome_cotacao_precos:        row[26]&.strip.presence,
      cpf_elaborador_termo:       row[27]&.strip.presence,
      nome_elaborador_termo:      row[28]&.strip.presence,
      forma_contratacao:          row[29]&.strip.presence,
      tipo_disputa:               row[30]&.strip.presence,
      url_plataforma:             row[31]&.strip.presence,
      sistema_registro_preco:     row[32]&.strip.presence,
      id_contratacao_pncp:        row[33]&.strip.presence,
      id_ata_pncp:                row[34]&.strip.presence
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