module TceCe
  # Centraliza a leitura de configuracao para manter os services enxutos.
  class Configuration
    class << self
      def settings
        @settings ||= begin
          yaml = YAML.load_file(Rails.root.join("config", "tce_ce.yml"), aliases: true)
          environment_settings = yaml.fetch(Rails.env)

          environment_settings.deep_symbolize_keys.tap do |config|
            config[:base_url] = ENV.fetch("TCE_CE_BASE_URL", config[:base_url])
            config[:cache_seconds] = ENV.fetch("TCE_CE_CACHE_SECONDS", config[:cache_seconds]).to_i
            config[:api_key] = ENV.fetch("TCE_CE_API_KEY", config[:api_key].to_s)
            config[:api_key_header_name] = ENV.fetch("TCE_CE_API_KEY_HEADER_NAME", config[:api_key_header_name].to_s)
            config[:swagger_ui_init_path] = ENV.fetch("TCE_CE_SWAGGER_UI_INIT_PATH", config[:swagger_ui_init_path].to_s)
          end
        end
      end

      def reset!
        @settings = nil
      end
    end
  end
end
