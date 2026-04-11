class Contract < ApplicationRecord  
    # Validação para garantir que o número do contrato seja obrigatório
    validates :numero_contrato, presence: true 
end
