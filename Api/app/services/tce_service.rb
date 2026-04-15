require "net/http"

class TceService
  BASE_URL = "https://api-dados-abertos.tce.ce.gov.br".freeze
  SPEC_PATH = Rails.root.join("lib", "tce_specs.json")
  CACHE_TTL = 24.hours
  COLLECTION_KEYS = %w[data items results records].freeze
  TAG_REPLACEMENTS = [
    ["DocumentaÃ§Ã£o", "Documentacao"],
    ["InformaÃ§Ãµes", "Informacoes"],
    ["BÃ¡sicas", "Basicas"],
    ["LicitaÃ§Ãµes", "Licitacoes"],
    ["ContrataÃ§Ãµes", "Contratacoes"],
    ["OrÃ§amento", "Orcamento"],
    ["MunicÃ­pio", "Municipio"],
    ["MunicÃ­pios", "Municipios"],
    ["GestÃ£o", "Gestao"],
    ["ExecuÃ§Ã£o", "Execucao"],
    ["ArrecadaÃ§Ã£o", "Arrecadacao"],
    ["Pessoal e Folha de Pagamento", "Pessoal e Folha de Pagamento"]
  ].freeze

  class UnsupportedEndpointError < StandardError; end

  class UpstreamError < StandardError
    attr_reader :status_code

    def initialize(message, status_code: nil)
      @status_code = status_code
      super(message)
    end
  end

  def definitions_for(endpoint)
    load_spec.dig("paths", "/#{normalize_endpoint(endpoint)}", "get")
  end

  def endpoints_catalog
    load_spec.fetch("paths", {}).each_with_object([]) do |(path, operations), endpoints|
      get_operation = operations["get"]
      next unless get_operation

      endpoint_key = path.to_s.delete_prefix("/")
      next if endpoint_key.blank?

      parameters = Array(get_operation["parameters"])
        .select { |parameter| parameter["in"].to_s == "query" }
        .map do |parameter|
          {
            name: parameter["name"],
            label: humanize_token(parameter["name"]),
            description: normalize_text(parameter["description"]),
            type: parameter.dig("schema", "type") || "string",
            required: parameter["required"] == true
          }
        end

      endpoints << {
        path: "/#{endpoint_key}",
        key: endpoint_key,
        label: humanize_token(endpoint_key),
        category: normalize_category(Array(get_operation["tags"]).first),
        summary: normalize_text(get_operation["summary"]),
        parameters: parameters,
        required_parameters: parameters.select { |parameter| parameter[:required] }
      }
    end.sort_by { |endpoint| [endpoint[:category].to_s, endpoint[:label].to_s] }
  end

  def fetch(endpoint, query_params = {})
    normalized_endpoint = normalize_endpoint(endpoint)
    raise UnsupportedEndpointError, normalized_endpoint unless supported_endpoint?(normalized_endpoint)

    sanitized_params = sanitize_params(query_params)
    cache_key = "tce/v2/#{normalized_endpoint}/#{sanitized_params.to_query}"

    Rails.cache.fetch(cache_key, expires_in: CACHE_TTL) do
      request_upstream(normalized_endpoint, sanitized_params)
    end
  end

  def supported_endpoint?(endpoint)
    definitions_for(endpoint).present?
  end

  private

  def request_upstream(endpoint, query_params)
    uri = URI.join("#{BASE_URL}/", endpoint)
    uri.query = URI.encode_www_form(query_params) if query_params.any?

    response = Net::HTTP.start(
      uri.host,
      uri.port,
      use_ssl: uri.scheme == "https",
      open_timeout: 15,
      read_timeout: 15
    ) do |http|
      http.request(Net::HTTP::Get.new(uri))
    end

    unless response.is_a?(Net::HTTPSuccess)
      raise UpstreamError.new("API do TCE retornou erro ao consultar #{endpoint}.", status_code: response.code.to_i)
    end

    parsed_response = JSON.parse(response.body)
    data, metadata = normalize_response(parsed_response)

    {
      endpoint: endpoint,
      source_url: uri.to_s,
      data: data,
      metadata: metadata
    }
  rescue JSON::ParserError => error
    raise UpstreamError, "Resposta invalida da API do TCE: #{error.message}"
  rescue Net::OpenTimeout, Net::ReadTimeout
    raise UpstreamError, "A API do TCE demorou demais para responder."
  rescue SocketError, Errno::EACCES, Errno::ECONNREFUSED, OpenSSL::SSL::SSLError => error
    raise UpstreamError, "Falha na conexao com o TCE: #{error.message}"
  end

  def normalize_response(payload)
    case payload
    when Array
      [payload.map { |item| normalize_item(item) }, {}]
    when Hash
      normalize_hash_payload(payload)
    else
      [[{ "value" => payload }], {}]
    end
  end

  def normalize_hash_payload(payload)
    extracted = extract_collection_from_object(payload)
    return extracted if extracted

    [[payload.deep_dup], {}]
  end

  def normalize_item(item)
    item.is_a?(Hash) ? item.deep_dup : { "value" => item }
  end

  def extract_collection_from_object(object)
    COLLECTION_KEYS.each do |key|
      next unless object.key?(key)

      value = object[key]

      if value.is_a?(Array)
        return [value.map { |item| normalize_item(item) }, object.except(key)]
      end

      if value.is_a?(Hash)
        nested = extract_collection_from_object(value)
        next unless nested

        items, metadata = nested
        return [items, object.except(key).merge(metadata)]
      end
    end

    array_entries = object.select { |_key, value| value.is_a?(Array) }
    if array_entries.size == 1
      key, collection = array_entries.first
      return [collection.map { |item| normalize_item(item) }, object.except(key)]
    end

    nil
  end

  def sanitize_params(query_params)
    query_params.to_h.each_with_object({}) do |(key, value), sanitized|
      normalized_value = value.is_a?(String) ? value.strip : value
      next if normalized_value.blank?

      sanitized[key] = should_format_exercicio?(key.to_s, normalized_value) ? "#{normalized_value}00" : normalized_value
    end
  end

  def should_format_exercicio?(key, value)
    key.include?("exercicio") && value.to_s.match?(/^\d{4}$/)
  end

  def normalize_endpoint(endpoint)
    endpoint.to_s.delete_prefix("/").strip
  end

  def normalize_category(category)
    normalized = normalize_text(category)
    normalized.presence || "Outros"
  end

  def normalize_text(value)
    normalized = value.to_s
    TAG_REPLACEMENTS.each do |source, target|
      normalized = normalized.gsub(source, target)
    end
    normalized.strip
  end

  def humanize_token(value)
    normalize_text(value)
      .tr("/", " ")
      .gsub("_", " ")
      .split(/\s+/)
      .filter(&:present?)
      .map do |word|
        downcased = word.downcase
        if %w[cpf cnpj rg cep cgm ug sim ibge].include?(downcased)
          downcased.upcase
        else
          downcased.capitalize
        end
      end
      .join(" ")
  end

  def load_spec
    @load_spec ||= begin
      if File.exist?(SPEC_PATH)
        JSON.parse(File.read(SPEC_PATH))
      else
        { "paths" => {} }
      end
    rescue JSON::ParserError
      { "paths" => {} }
    end
  end
end
