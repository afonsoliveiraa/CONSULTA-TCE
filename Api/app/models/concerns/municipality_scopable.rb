module MunicipalityScopable
  extend ActiveSupport::Concern

  class_methods do
    def for_municipality_code(municipality_code)
      normalized_code = municipality_code.to_s.strip
      return all if normalized_code.blank?

      joins(:municipality).where(municipalities: { code: normalized_code })
    end
  end
end
