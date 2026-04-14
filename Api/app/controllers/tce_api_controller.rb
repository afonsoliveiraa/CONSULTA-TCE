# app/controllers/tce_api_controller.rb
require 'httparty'

class TceApiController < ApplicationController
  # GET /tce/definitions/*endpoint
  # Serve para o Frontend (Preact) saber quais campos renderizar e quais são obrigatórios
  def definitions
    endpoint = "/#{params[:endpoint]}"
    spec = load_tce_spec

    # Busca a definição do GET para o path informado
    endpoint_spec = spec.dig('paths', endpoint, 'get')

    if endpoint_spec
      render json: {
        summary: endpoint_spec['summary'],
        parameters: endpoint_spec['parameters'] || []
      }
    else
      render json: { error: "Definições para '#{endpoint}' não encontradas." }, status: :not_found
    end
  end

  # GET /tce/*endpoint
  # O "Túnel" dinâmico que consome qualquer endpoint da API do TCE
  def fetch
    endpoint = params[:endpoint]

    # 1. Validação de Segurança: O endpoint existe no nosso mapeamento?
    unless TCE_ENDPOINTS.include?(endpoint)
      return render json: { error: "Endpoint '#{endpoint}' não suportado." }, status: :not_found
    end

    # 2. Chave de Cache: Única por URL e Parâmetros (Ex: tce/licitacoes?ano=2024)
    cache_key = "tce_v1/#{endpoint}/#{request.query_parameters.to_query}"

    # 3. Execução com Cache de 24 horas
    response_data = Rails.cache.fetch(cache_key, expires_in: 24.hours) do
      execute_external_request(endpoint, request.query_parameters)
    end

    render json: response_data
  end

  private

  # Realiza a chamada HTTP externa
  def execute_external_request(endpoint, query_params)
    url = "https://api-dados-abertos.tce.ce.gov.br/#{endpoint}"
    
    # Aplica as regras de negócio nos parâmetros (ex: formatar anos)
    sanitized_params = sanitize_params(query_params)

    begin
      response = HTTParty.get(url, query: sanitized_params, timeout: 15)
      
      if response.success?
        response.parsed_response
      else
        { 
          error: "API do TCE retornou um erro", 
          details: response.message, 
          code: response.code 
        }
      end
    rescue Net::OpenTimeout, Net::ReadTimeout
      { error: "A API do TCE demorou demais para responder (Timeout)." }
    rescue StandardError => e
      { error: "Falha na conexão com o TCE", details: e.message }
    end
  end

  # TRATAMENTO SÊNIOR: Ajusta os parâmetros para o padrão que o TCE exige
  def sanitize_params(params)
    # Convertemos para Hash comum para poder manipular
    safe_params = params.to_unsafe_h.dup

    safe_params.each do |key, value|
      next if value.blank?

      # Regra do Exercício: Se o campo tem "exercicio" no nome e tem 4 dígitos (ex: 2024)
      # Adiciona "00" no final para bater com o padrão exigido pelo TCE
      if key.to_s.include?('exercicio') && value.to_s.match?(/^\d{4}$/)
        safe_params[key] = "#{value}00"
      end

      # Dica: Você pode adicionar outras regras aqui, como remover máscara de CPF/CNPJ
    end

    safe_params
  end

  # Carrega o JSON de especificações local
  def load_tce_spec
    json_path = Rails.root.join('lib', 'tce_specs.json')
    JSON.parse(File.read(json_path))
  rescue StandardError
    { 'paths' => {} }
  end
end