module TceCe
  # Representa um parametro individual do endpoint remoto do TCE-CE.
  class QueryParameterDefinition
    attr_reader :name, :required, :description, :type

    def initialize(name:, required:, description: nil, type: "text")
      @name = name.to_s
      @required = required
      @description = description
      @type = normalize_type(type, @name, @description)
    end

    def required?
      required
    end

    def to_frontend_field
      {
        name: name,
        label: humanized_label,
        description: description.to_s,
        type: type,
        required: required?
      }
    end

    private

    def normalize_type(value, field_name, field_description)
      normalized_value = value.to_s.downcase
      normalized_name = field_name.to_s.downcase
      normalized_description = field_description.to_s.downcase

      case normalized_value
      when "integer", "number", "float", "double", "decimal"
        "number"
      when "date", "datetime", "string(date-time)"
        "date"
      else
        inferred_date_type?(normalized_name, normalized_description) ? "date" : "text"
      end
    end

    def inferred_date_type?(normalized_name, normalized_description)
      return true if normalized_name.start_with?("data_")
      return true if normalized_name.include?("_data_")
      return true if normalized_name.end_with?("_data")
      return true if normalized_name.start_with?("periodo_")
      return true if normalized_name.include?("periodo")

      description_mentions_date_range?(normalized_description)
    end

    def description_mentions_date_range?(normalized_description)
      return false if normalized_description.blank?

      normalized_description.include?("yyyy-mm-dd") ||
        normalized_description.include?("intervalos") ||
        normalized_description.include?("intervalo") ||
        normalized_description.include?("data de") ||
        normalized_description.include?("data da")
    end

    def humanized_label
      name
        .to_s
        .tr("_", " ")
        .split
        .map { |word| word.upcase == "CPF" ? "CPF" : word.capitalize }
        .join(" ")
    end
  end
end
