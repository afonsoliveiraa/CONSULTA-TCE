class Vehicle < ApplicationRecord
  include MunicipalityScopable
  include MunicipalityPresentable

  belongs_to :municipality, optional: true

  # O RENAVAM e a referencia documental identificam o cadastro importado para consulta posterior.
  validates :codigo_renavam, presence: true
  validates :data_referencia_documentacao, presence: true
end
