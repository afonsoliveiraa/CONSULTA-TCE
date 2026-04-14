class Contract < ApplicationRecord  
    # Validação para garantir que o código do renavam seja obrigatório
    validates :codigo_renavam, presence: true 
end
