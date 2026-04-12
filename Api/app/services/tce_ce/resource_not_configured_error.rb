module TceCe
  # Disparado quando o frontend pede um recurso que nao existe no catalogo carregado.
  class ResourceNotConfiguredError < Error
    def initialize(resource)
      super("Recurso '#{resource}' nao esta configurado para consulta.")
    end
  end
end
