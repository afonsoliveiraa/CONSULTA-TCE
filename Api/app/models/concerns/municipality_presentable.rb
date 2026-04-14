module MunicipalityPresentable
  extend ActiveSupport::Concern

  included do
    def municipality_code
      municipality&.code || self[:cod_municipio]
    end

    def municipality_name
      municipality&.name
    end

    def as_json(options = nil)
      super(options).merge(
        "municipality_code" => municipality_code,
        "municipality_name" => municipality_name
      )
    end
  end
end
