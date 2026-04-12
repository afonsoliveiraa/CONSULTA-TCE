module TceCe
  # Mapeia 404 do TCE para uma excecao sem vazar regra HTTP para o restante da app.
  class UpstreamResourceNotFoundError < Error
    def initialize(resource, source_url)
      super("O endpoint remoto '#{resource}' nao foi encontrado em #{source_url}.")
    end
  end
end
