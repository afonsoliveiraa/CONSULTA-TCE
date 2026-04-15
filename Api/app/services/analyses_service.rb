class AnalysesService
    # Dado estruturado (facilita para usar o pagy) para o resultado do processamento do arquivo NE, incluindo os dados da linha, os contratos relacionados e o número da linha no arquivo
    FileProcessResult = Data.define(:data, :contracts, :line_number)

    # Otimizar chamada no controller
    def self.fileprocess(file, error_lines)
        new(file, error_lines).fileprocess
    end

    # Construtor que recebe o arquivo e as linhas com erro
    def initialize(file, error_lines)
        @file = file
        @error_lines = Array(error_lines).map(&:to_i)
    end

    def fileprocess
        results = [] # Inicializa o array de resultados
        # Percorre o arquivo NE para pegar os campos necessários para a análise e ainda fornece o index / númerod a linha
        CSV.foreach(@file.path, encoding: 'ISO-8859-1', col_sep: ',', quote_char: '"', skip_blanks: true).with_index(1) do |row, index|            
            
            # Se a linha tiver o campo do número de contrato vazio só pula a linha
            if @error_lines.include?(index) && row[24].present?

                ne = map_row(row)

                # Retorna um objeto estruturado (OpenStruct ou Hash) para o controller
                results << FileProcessResult.new(
                    data: ne,   
                    contracts: Contract.where(
                                numero_contrato: ne[:numero_contrato], 
                                cod_municipio: ne[:cod_municipio]
                                ).where(
                                "vigencia_inicial <= :data AND vigencia_final >= :data", 
                                data: ne[:data_assinatura_contrato]
                                ),
                    line_number: index  
                )
            elsif @error_lines.include?(index) && !row[24].present?
                ne = map_row(row)

                # Retorna um objeto sem contrato para a NE  
                results << FileProcessResult.new(
                    data: ne,
                    contracts: [],
                    line_number: index,
                )
            end
        end
        puts results
        results
    end

    def map_row(row)
        { 
            numero_contrato: row[24]&.strip.presence,
            cpf_gestor_contrato: row[23]&.strip.presence,
            data_assinatura_contrato: parse_date(row[25]),
            numero_licitacao: row[26]&.strip.presence,
            data_licitacao: parse_date(row[27]),
            cod_municipio: row[1]&.strip.presence,
        }
    end

    # Metodo para converter datas no formato dd/mm/yyyy para o formato Date do Ruby
    def parse_date(str)
        return nil if str.blank? || str.to_s.strip == "0"
        Date.strptime(str.to_s.strip, '%Y%m%d') rescue nil
    end
  
end