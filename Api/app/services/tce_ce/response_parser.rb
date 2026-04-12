module TceCe
  # Normaliza respostas heterogeneas do TCE-CE em uma colecao de objetos + metadata.
  class ResponseParser
    CANDIDATE_COLLECTION_PROPERTIES = %w[data items results records].freeze

    class << self
      def normalize(root)
        case root
        when Array
          [to_object_list(root), {}]
        when Hash
          normalize_object(root)
        else
          [[{ "value" => root }], {}]
        end
      end

      private

      def normalize_object(object)
        extracted = try_extract_collection(object)
        return extracted if extracted

        [[object.deep_dup], {}]
      end

      def try_extract_collection(object)
        CANDIDATE_COLLECTION_PROPERTIES.each do |property_name|
          next unless object.key?(property_name)

          value = object[property_name]

          if value.is_a?(Array)
            return [to_object_list(value), clone_without(object, property_name)]
          end

          if value.is_a?(Hash)
            nested = try_extract_collection(value)
            next unless nested

            items, metadata = nested
            return [items, clone_without(object, property_name).merge(metadata)]
          end
        end

        array_properties = object.select { |_key, value| value.is_a?(Array) }
        if array_properties.size == 1
          property_name, array = array_properties.first
          return [to_object_list(array), clone_without(object, property_name)]
        end

        nil
      end

      def clone_without(object, property_to_exclude)
        object.each_with_object({}) do |(key, value), metadata|
          next if key.to_s.casecmp(property_to_exclude.to_s).zero?

          metadata[key] = value.deep_dup
        end
      end

      def to_object_list(array)
        array.map do |item|
          item.is_a?(Hash) ? item.deep_dup : { "value" => item }
        end
      end
    end
  end
end
