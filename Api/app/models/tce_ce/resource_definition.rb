module TceCe
  # Modela um endpoint remoto e concentra o contrato que o frontend consome.
  class ResourceDefinition
    INTERNAL_FRONTEND_FIELD_NAMES = %w[codigo_municipio deslocamento quantidade].freeze

    attr_reader :key, :path, :category, :description, :query_parameters, :pagination_mode, :requires_authentication

    def initialize(
      key:,
      path:,
      category:,
      description:,
      query_parameters:,
      pagination_mode: :auto,
      requires_authentication: false
    )
      @key = key.to_s
      @path = path.to_s
      @category = category.to_s
      @description = description.to_s
      @query_parameters = query_parameters
      @pagination_mode = pagination_mode.to_sym
      @requires_authentication = requires_authentication
    end

    def required_query_parameters
      query_parameters.select(&:required?)
    end

    def optional_query_parameters
      query_parameters.reject(&:required?)
    end

    def frontend_required_query_parameters
      required_query_parameters.reject { |parameter| hidden_from_frontend?(parameter) }
    end

    def frontend_optional_query_parameters
      optional_query_parameters.reject { |parameter| hidden_from_frontend?(parameter) }
    end

    def source_pagination?
      return true if pagination_mode == :source
      return false if pagination_mode == :local

      parameter_names = query_parameters.map { |parameter| parameter.name.downcase }
      parameter_names.include?("quantidade") || parameter_names.include?("deslocamento")
    end

    def to_frontend_hash
      {
        key: key,
        path: path,
        category: category,
        description: description,
        # O municipio ja e escolhido fora do formulario e a paginacao e controlada pela aplicacao.
        requiredFields: frontend_required_query_parameters.map(&:to_frontend_field),
        optionalFields: frontend_optional_query_parameters.map(&:to_frontend_field)
      }
    end

    private

    def hidden_from_frontend?(parameter)
      INTERNAL_FRONTEND_FIELD_NAMES.include?(parameter.name.to_s.downcase)
    end
  end
end
