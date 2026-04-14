module TceCe
  # Envelope interno para serializar a resposta paginada do TCE-CE.
  class PaginatedEnvelope
    attr_reader :resource, :source_url, :page, :page_size, :total_items, :total_pages,
                :items, :metadata, :cached_at_utc, :expires_at_utc

    def initialize(resource:, source_url:, page:, page_size:, total_items:, total_pages:, items:, metadata:, cached_at_utc:, expires_at_utc:)
      @resource = resource
      @source_url = source_url
      @page = page
      @page_size = page_size
      @total_items = total_items
      @total_pages = total_pages
      @items = items
      @metadata = metadata
      @cached_at_utc = cached_at_utc
      @expires_at_utc = expires_at_utc
    end
  end
end
