class Municipality < ApplicationRecord
  # O codigo do municipio e a chave natural usada para unificar os registros importados.
  validates :code, presence: true, uniqueness: true

  has_many :contracts, dependent: :restrict_with_exception
  has_many :biddings, dependent: :restrict_with_exception
  has_many :vehicles, dependent: :restrict_with_exception
end
