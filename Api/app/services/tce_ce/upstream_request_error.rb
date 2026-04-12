module TceCe
  # Representa respostas HTTP invalidas do TCE preservando status e corpo.
  class UpstreamRequestError < Error
    attr_reader :status_code, :body

    def initialize(resource, source_url, status_code, body = nil)
      @status_code = status_code.to_i
      @body = body.to_s
      super("Falha ao consultar '#{resource}' em #{source_url}. Status #{@status_code}. #{body}".strip)
    end
  end
end
