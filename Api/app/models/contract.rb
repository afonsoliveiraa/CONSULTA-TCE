class Contract < ApplicationRecord
  include MunicipalityScopable
  include MunicipalityPresentable

  belongs_to :municipality, optional: true

  # O numero do contrato continua obrigatorio para a consulta principal da tela.
  validates :numero_contrato, presence: true
end
