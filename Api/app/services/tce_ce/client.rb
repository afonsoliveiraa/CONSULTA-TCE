require "net/http"

module TceCe
  # Responsavel por consultar o TCE-CE, aplicar cache e devolver um envelope padronizado.
  class Client
    def initialize(resource_catalog: ResourceCatalog, cache: Rails.cache, logger: Rails.logger)
      @resource_catalog = resource_catalog
      @cache = cache
      @logger = logger
      @settings = Configuration.settings
    end

    def get_resource_page(resource:, pagination:, query_parameters:)
      definition = @resource_catalog.find!(resource)
      effective_query_parameters = Pagination.apply_source_pagination(definition, pagination, query_parameters)
      source_url = build_source_url(definition.path, effective_query_parameters)
      cache_key = "tcece::#{resource}::#{source_url}"
      request_started_at = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      cache_hit = @cache.exist?(cache_key)

      cached_payload = @cache.fetch(cache_key, expires_in: @settings.fetch(:cache_seconds).seconds) do
        fetch_upstream_payload(resource: resource, source_url: source_url)
      end

      request_duration_ms = elapsed_milliseconds_since(request_started_at)
      envelope = Pagination.build_envelope(
        resource: resource,
        source_url: source_url,
        pagination: pagination,
        definition: definition,
        items: cached_payload.fetch(:items),
        metadata: cached_payload.fetch(:metadata).merge(
          "cacheHit" => cache_hit,
          "requestDurationMs" => request_duration_ms,
          "upstreamDurationMs" => cached_payload.fetch(:upstream_duration_ms)
        ),
        cached_at_utc: cached_payload.fetch(:cached_at_utc),
        cache_seconds: @settings.fetch(:cache_seconds)
      )

      envelope
    rescue ResourceNotConfiguredError
      raise
    rescue UpstreamRequestError, UpstreamConnectivityError, UpstreamResourceNotFoundError
      raise
    rescue StandardError => error
      raise UpstreamConnectivityError.new(resource, source_url || "desconhecido", error)
    end

    private

    def fetch_upstream_payload(resource:, source_url:)
      upstream_started_at = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      uri = URI.parse(source_url)
      request = Net::HTTP::Get.new(uri)

      if @settings[:api_key].present? && @settings[:api_key_header_name].present?
        request[@settings[:api_key_header_name]] = @settings[:api_key]
      end

      response = Net::HTTP.start(
        uri.host,
        uri.port,
        use_ssl: uri.scheme == "https",
        open_timeout: 30,
        read_timeout: 30
      ) do |http|
        http.request(request)
      end

      if response.code.to_i == 404
        raise UpstreamResourceNotFoundError.new(resource, source_url)
      end

      unless response.is_a?(Net::HTTPSuccess)
        @logger.warn("Falha ao consultar o TCE-CE. Status=#{response.code} Resource=#{resource} Url=#{source_url} Body=#{response.body}")
        raise UpstreamRequestError.new(resource, source_url, response.code.to_i, response.body)
      end

      parsed_json = JSON.parse(response.body)
      items, metadata = ResponseParser.normalize(parsed_json)
      upstream_duration_ms = elapsed_milliseconds_since(upstream_started_at)

      @logger.info("TCE-CE upstream request completed. Resource=#{resource} Url=#{source_url} DurationMs=#{upstream_duration_ms} ItemCount=#{items.length}")

      {
        items: items,
        metadata: metadata,
        source_url: source_url,
        upstream_duration_ms: upstream_duration_ms,
        cached_at_utc: Time.current,
        cache_key: nil
      }
    rescue JSON::ParserError => error
      raise UpstreamRequestError.new(resource, source_url, 502, "Resposta JSON invalida: #{error.message}")
    rescue Net::OpenTimeout, Net::ReadTimeout, SocketError, Errno::ECONNREFUSED, OpenSSL::SSL::SSLError => error
      raise UpstreamConnectivityError.new(resource, source_url, error)
    end

    def build_source_url(path, query_parameters)
      base_url = @settings.fetch(:base_url).to_s
      base_url = "#{base_url}/" unless base_url.end_with?("/")
      uri = URI.join(base_url, path.to_s.delete_prefix("/"))
      uri.query = URI.encode_www_form(query_parameters) if query_parameters.any?
      uri.to_s
    end

    def elapsed_milliseconds_since(started_at)
      ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - started_at) * 1000).round
    end
  end
end
