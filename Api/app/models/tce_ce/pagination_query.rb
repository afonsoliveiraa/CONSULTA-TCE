module TceCe
  # Mantem a mesma normalizacao de paginacao usada no proxy original em .NET.
  class PaginationQuery
    RESERVED_KEYS = %w[page pageSize].freeze

    attr_reader :page, :page_size

    def initialize(page:, page_size:)
      @page = page.to_i
      @page_size = page_size.to_i
    end

    def normalized_page
      page < 1 ? 1 : page
    end

    def normalized_page_size
      return 25 if page_size < 1
      return 250 if page_size > 250

      page_size
    end
  end
end
