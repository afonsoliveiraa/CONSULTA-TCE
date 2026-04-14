module TceCe
  # Encapsula falhas de rede, timeout e DNS ao chamar o TCE.
  class UpstreamConnectivityError < Error
    def initialize(resource, source_url, cause = nil)
      super("Falha de conectividade ao consultar '#{resource}' em #{source_url}. #{cause&.message}".strip)
    end
  end
end
