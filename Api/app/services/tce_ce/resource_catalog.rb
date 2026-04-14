module TceCe
  # Carrega o catalogo dinamicamente do swagger do TCE-CE e usa YAML como fallback.
  class ResourceCatalog
    CANDIDATE_TAG_REPLACEMENTS = [
      ["Documentacao referente a ", ""],
      ["Documentação referente a ", ""],
      [" - SIM", ""]
    ].freeze

    class << self
      def resources
        @resources ||= load_resources
      end

      def reset!
        @resources = nil
      end

      def find!(key)
        resources.fetch(key.to_s) { raise ResourceNotConfiguredError, key }
      end

      private

      def load_resources
        swagger_path = resolve_swagger_path(Configuration.settings.fetch(:swagger_ui_init_path))

        if File.exist?(swagger_path)
          load_resources_from_swagger(swagger_path)
        else
          Rails.logger.warn("Arquivo swagger-ui-init.js nao encontrado em #{swagger_path}. Usando catalogo fallback.")
          load_resources_from_fallback
        end
      rescue StandardError => error
        Rails.logger.error("Falha ao carregar catalogo TCE-CE via Swagger: #{error.message}. Usando fallback YAML.")
        load_resources_from_fallback
      end

      def load_resources_from_swagger(swagger_path)
        content = File.read(swagger_path)
        swagger_json = extract_swagger_document(content)
        document = JSON.parse(swagger_json)
        paths = document.fetch("paths")

        paths.each_with_object({}) do |(path, operations), resources|
          get_operation = operations["get"]
          next unless get_operation

          key = path.to_s.delete_prefix("/")
          next if key.blank?

          query_parameters = Array(get_operation["parameters"])
            .select { |parameter| parameter["in"].to_s.casecmp("query").zero? }
            .sort_by { |parameter| [parameter["required"] ? 0 : 1, parameter["name"].to_s] }
            .map do |parameter|
              QueryParameterDefinition.new(
                name: parameter["name"],
                required: parameter["required"] == true,
                description: parameter["description"],
                type: parameter.dig("schema", "type")
              )
            end

          resources[key] = ResourceDefinition.new(
            key: key,
            path: key,
            category: extract_primary_tag(get_operation),
            description: get_operation["summary"].to_s,
            query_parameters: query_parameters
          )
        end
      end

      def load_resources_from_fallback
        Configuration.settings.fetch(:resources).each_with_object({}) do |(key, resource), resources|
          required_parameters = Array(resource[:required_query_parameters])
          optional_parameters = Array(resource[:optional_query_parameters])

          query_parameters = required_parameters.map do |parameter_name|
            QueryParameterDefinition.new(name: parameter_name, required: true)
          end

          query_parameters.concat(
            optional_parameters.map do |parameter_name|
              QueryParameterDefinition.new(name: parameter_name, required: false)
            end
          )

          resources[key.to_s] = ResourceDefinition.new(
            key: key,
            path: resource[:path],
            category: resource[:category],
            description: resource[:description],
            query_parameters: query_parameters
          )
        end
      end

      def resolve_swagger_path(configured_path)
        return configured_path if Pathname.new(configured_path).absolute?

        Rails.root.join(configured_path).expand_path.to_s
      end

      def extract_swagger_document(content)
        marker = '"swaggerDoc":'
        marker_index = content.index(marker)
        raise "Nao foi possivel localizar 'swaggerDoc' no arquivo." unless marker_index

        start_index = content.index("{", marker_index + marker.length)
        raise "Nao foi possivel localizar o inicio do JSON do Swagger." unless start_index

        end_index = find_matching_brace(content, start_index)
        content[start_index..end_index]
      end

      def find_matching_brace(content, start_index)
        depth = 0
        in_string = false
        escaped = false

        content.chars.each_with_index do |char, index|
          next if index < start_index

          if in_string
            if escaped
              escaped = false
              next
            end

            if char == "\\"
              escaped = true
              next
            end

            in_string = false if char == '"'
            next
          end

          if char == '"'
            in_string = true
            next
          end

          depth += 1 if char == "{"

          if char == "}"
            depth -= 1
            return index if depth.zero?
          end
        end

        raise "Nao foi possivel encontrar o fechamento do JSON do Swagger."
      end

      def extract_primary_tag(operation)
        tag = Array(operation["tags"]).first.to_s
        return "Outros" if tag.blank?

        CANDIDATE_TAG_REPLACEMENTS.reduce(tag) do |normalized_tag, (search, replacement)|
          normalized_tag.gsub(search, replacement)
        end.strip.presence || "Outros"
      end
    end
  end
end
