require 'httparty'
require 'json'
require 'set'

class TceApiService
  BASE_URL = 'https://api-dados-abertos.tce.ce.gov.br'.freeze
  SPEC_PATH = Rails.root.join('lib', 'tce_specs.json')
  CACHE_NAMESPACE = 'tce_v4'.freeze

  def self.catalog
    new.catalog
  end

  def self.municipalities
    new.municipalities
  end

  def self.definitions(endpoint)
    new.definitions(endpoint)
  end

  def self.query(endpoint, raw_params)
    new.query(endpoint, raw_params)
  end

  def catalog
    spec_paths.map do |path, operation|
      parameters = normalize_parameters(operation['parameters'] || [])

      {
        key: path.delete_prefix('/'),
        path: path,
        label: operation['summary'].presence || path.delete_prefix('/').tr('_', ' ').titleize,
        category: Array(operation['tags']).first.to_s,
        summary: operation['summary'].to_s,
        parameters: parameters,
        required_parameters: parameters.select { |parameter| parameter[:required] }
      }
    end.sort_by { |entry| [entry[:category], entry[:label]] }
  end

  def municipalities
    response = query('municipios', {})
    response[:data].sort_by { |item| item['nome_municipio'].to_s }
  end

  def definitions(endpoint)
    path = normalize_path(endpoint)
    operation = spec_paths[path]
    return nil unless operation

    {
      summary: operation['summary'].to_s,
      parameters: normalize_parameters(operation['parameters'] || [])
    }
  end

  def query(endpoint, raw_params)
    normalized_endpoint = normalize_endpoint_key(endpoint)
    raise ArgumentError, "Endpoint '#{normalized_endpoint}' nao suportado." unless supported_endpoint?(normalized_endpoint)

    sanitized_params = sanitize_params(raw_params)
    source_url = build_source_url(normalized_endpoint, sanitized_params)
    cache_key = "#{CACHE_NAMESPACE}/#{normalized_endpoint}/#{sanitized_params.to_a.sort_by(&:first).to_h.to_query}"

    Rails.cache.fetch(cache_key, expires_in: 24.hours) do
      execute_query(normalized_endpoint, sanitized_params, source_url)
    end
  end

  class ExternalApiError < StandardError
    attr_reader :code, :details

    def initialize(message, code:, details: nil)
      super(message)
      @code = code
      @details = details
    end
  end

  private

  def execute_query(endpoint, sanitized_params, source_url)
    normalized_payload =
      if paginated_query?(endpoint)
        fetch_all_pages(endpoint, sanitized_params)
      else
        perform_request(endpoint, sanitized_params)
      end

    {
      endpoint: endpoint,
      source_url: source_url,
      data: normalized_payload[:data],
      metadata: normalized_payload[:metadata]
    }
  rescue Net::OpenTimeout, Net::ReadTimeout
    raise ExternalApiError.new('A API do TCE demorou demais para responder.', code: 504)
  rescue SocketError, Errno::EACCES, Errno::ECONNREFUSED, OpenSSL::SSL::SSLError => e
    raise ExternalApiError.new('Falha na conexao com a API do TCE.', code: 502, details: e.message)
  end

  def fetch_all_pages(endpoint, sanitized_params)
    chunk_size = extract_chunk_size(sanitized_params)
    offset = 0
    total = nil
    items = []

    loop do
      page_payload = perform_request(
        endpoint,
        sanitized_params.merge(
          'quantidade' => chunk_size.to_s,
          'deslocamento' => offset.to_s
        )
      )

      page_items = page_payload[:data]
      page_length = page_items.length
      page_total = page_payload.dig(:metadata, :total).to_i

      total = page_total if page_total.positive?
      items.concat(page_items)

      break if page_length.zero?
      break if total && items.length >= total
      break if page_length < chunk_size

      offset += page_length
    end

    {
      data: items,
      metadata: {
        total: total || items.length,
        length: items.length
      }
    }
  end

  def perform_request(endpoint, params)
    response = HTTParty.get("#{BASE_URL}/#{endpoint}", query: params, timeout: 20)

    unless response.success?
      raise ExternalApiError.new(
        'API do TCE retornou um erro.',
        code: response.code,
        details: response.message
      )
    end

    normalize_payload(response.parsed_response)
  end

  def normalize_payload(payload)
    case payload
    when Array
      {
        data: payload.map { |item| normalize_item(item) },
        metadata: { total: payload.length, length: payload.length }
      }
    when Hash
      if payload['data'].is_a?(Hash) && payload['data']['data'].is_a?(Array)
        nested = payload['data']
        {
          data: nested['data'].map { |item| normalize_item(item) },
          metadata: {
            total: nested['total'] || nested['length'] || nested['data'].length,
            length: nested['length'] || nested['data'].length
          }
        }
      elsif payload['data'].is_a?(Array)
        {
          data: payload['data'].map { |item| normalize_item(item) },
          metadata: {
            total: payload['total'] || payload['length'] || payload['data'].length,
            length: payload['length'] || payload['data'].length
          }
        }
      else
        {
          data: [normalize_item(payload)],
          metadata: { total: 1, length: 1 }
        }
      end
    else
      {
        data: [],
        metadata: { total: 0, length: 0 }
      }
    end
  end

  def normalize_item(item)
    item.is_a?(Hash) ? item.as_json : { 'valor' => item }
  end

  def supported_endpoint?(endpoint)
    endpoint_keys.include?(endpoint)
  end

  def endpoint_keys
    @endpoint_keys ||= spec_paths.keys.map { |path| path.delete_prefix('/') }.to_set
  end

  def spec_paths
    @spec_paths ||= load_spec.fetch('paths', {}).each_with_object({}) do |(path, definition), result|
      operation = definition['get']
      result[path] = operation if operation.present?
    end
  end

  def load_spec
    return { 'paths' => {} } unless File.exist?(SPEC_PATH)

    JSON.parse(File.read(SPEC_PATH))
  rescue JSON::ParserError
    { 'paths' => {} }
  end

  def normalize_parameters(parameters)
    parameters.map do |parameter|
      {
        name: parameter['name'].to_s,
        label: parameter['name'].to_s.humanize,
        description: parameter['description'].to_s,
        type: parameter.dig('schema', 'type').presence || 'string',
        required: !!parameter['required']
      }
    end
  end

  def paginated_query?(endpoint)
    parameter_names = endpoint_parameter_names(endpoint)
    parameter_names.include?('quantidade') && parameter_names.include?('deslocamento')
  end

  def endpoint_parameter_names(endpoint)
    spec_paths
      .fetch(normalize_path(endpoint), {})
      .fetch('parameters', [])
      .map { |parameter| parameter['name'].to_s }
      .to_set
  end

  def normalize_path(endpoint)
    "/#{normalize_endpoint_key(endpoint)}"
  end

  def normalize_endpoint_key(endpoint)
    endpoint.to_s.delete_prefix('/').strip
  end

  def sanitize_params(params)
    source =
      if params.respond_to?(:to_unsafe_h)
        params.to_unsafe_h
      else
        params.to_h
      end

    source.each_with_object({}) do |(key, value), result|
      next if value.blank?

      string_value = value.is_a?(String) ? value.strip : value
      next if string_value.blank?

      result[key.to_s] = normalize_param_value(key.to_s, string_value)
    end
  end

  def normalize_param_value(key, value)
    if key.include?('exercicio') && value.to_s.match?(/^\d{4}$/)
      "#{value}00"
    else
      value
    end
  end

  def extract_chunk_size(params)
    quantity = params['quantidade'].to_i
    return quantity if quantity.positive?

    100
  end

  def build_source_url(endpoint, params)
    query = params.to_query
    return "#{BASE_URL}/#{endpoint}" if query.blank?

    "#{BASE_URL}/#{endpoint}?#{query}"
  end
end
