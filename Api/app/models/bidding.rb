class Bidding < ApplicationRecord
  include MunicipalityScopable
  include MunicipalityPresentable

  belongs_to :municipality, optional: true
end
