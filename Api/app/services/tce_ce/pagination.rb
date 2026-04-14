module TceCe
  # Mantem o mesmo algoritmo do proxy .NET para paginacao local e remota.
  class Pagination
    class << self
      def apply_source_pagination(definition, pagination, query_parameters)
        return query_parameters unless definition.source_pagination?

        query_parameters.merge(
          "quantidade" => pagination.normalized_page_size.to_s,
          "deslocamento" => ((pagination.normalized_page - 1) * pagination.normalized_page_size).to_s
        )
      end

      def build_envelope(resource:, source_url:, pagination:, definition:, items:, metadata:, cached_at_utc:, cache_seconds:)
        if definition.source_pagination?
          build_source_paginated_envelope(
            resource: resource,
            source_url: source_url,
            pagination: pagination,
            definition: definition,
            items: items,
            metadata: metadata,
            cached_at_utc: cached_at_utc,
            cache_seconds: cache_seconds
          )
        else
          build_local_paginated_envelope(
            resource: resource,
            source_url: source_url,
            pagination: pagination,
            items: items,
            metadata: metadata,
            cached_at_utc: cached_at_utc,
            cache_seconds: cache_seconds
          )
        end
      end

      private

      def build_local_paginated_envelope(resource:, source_url:, pagination:, items:, metadata:, cached_at_utc:, cache_seconds:)
        total_items = items.length
        total_pages = total_items.zero? ? 0 : (total_items.to_f / pagination.normalized_page_size).ceil
        skip = (pagination.normalized_page - 1) * pagination.normalized_page_size
        page_items = items.drop(skip).first(pagination.normalized_page_size)
        normalized_metadata = metadata.deep_dup
        # Em paginação local nós já conhecemos o conjunto completo, então não existem páginas extras ocultas.
        normalized_metadata["hasMorePages"] = pagination.normalized_page < total_pages
        normalized_metadata["sourcePagination"] = false
        normalized_metadata["totalItemsExact"] = true
        normalized_metadata["paginationMode"] = "Local"

        PaginatedEnvelope.new(
          resource: resource,
          source_url: source_url,
          page: pagination.normalized_page,
          page_size: pagination.normalized_page_size,
          total_items: total_items,
          total_pages: total_pages,
          items: page_items,
          metadata: normalized_metadata,
          cached_at_utc: cached_at_utc,
          expires_at_utc: cached_at_utc + cache_seconds.seconds
        )
      end

      def build_source_paginated_envelope(resource:, source_url:, pagination:, definition:, items:, metadata:, cached_at_utc:, cache_seconds:)
        has_more_pages = items.length == pagination.normalized_page_size
        exact_total_items = try_read_total_item_count(metadata)
        total_items_exact = !exact_total_items.nil?
        total_items = exact_total_items || infer_total_items(
          page: pagination.normalized_page,
          page_size: pagination.normalized_page_size,
          current_item_count: items.length,
          has_more_pages: has_more_pages
        )
        total_pages = total_items.zero? ? 0 : (total_items.to_f / pagination.normalized_page_size).ceil
        normalized_metadata = metadata.deep_dup
        normalized_metadata["hasMorePages"] = total_items_exact ? pagination.normalized_page < total_pages : has_more_pages
        normalized_metadata["sourcePagination"] = true
        normalized_metadata["totalItemsExact"] = total_items_exact
        normalized_metadata["paginationMode"] = definition.pagination_mode.to_s.capitalize

        PaginatedEnvelope.new(
          resource: resource,
          source_url: source_url,
          page: pagination.normalized_page,
          page_size: pagination.normalized_page_size,
          total_items: total_items,
          total_pages: total_pages,
          items: items,
          metadata: normalized_metadata,
          cached_at_utc: cached_at_utc,
          expires_at_utc: cached_at_utc + cache_seconds.seconds
        )
      end

      def infer_total_items(page:, page_size:, current_item_count:, has_more_pages:)
        known_item_count = ((page - 1) * page_size) + current_item_count
        has_more_pages ? known_item_count + 1 : known_item_count
      end

      def try_read_total_item_count(metadata)
        %w[total totalItems count].each do |property_name|
          value = metadata[property_name]
          next if value.nil?

          return value if value.is_a?(Integer)
          return value.to_i if value.to_s.match?(/\A\d+\z/)
        end

        nil
      end
    end
  end
end
