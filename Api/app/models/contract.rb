class Contract < ApplicationRecord  
    # Validação para garantir que o código do renavam seja obrigatório
    validates :numero_contrato, presence: true 
end
