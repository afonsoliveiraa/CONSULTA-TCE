class MunicipalityLookupService
  def self.find_or_create_by_code(municipality_code)
    normalized_code = municipality_code.to_s.strip
    return nil if normalized_code.blank?

    # Centraliza a resolucao do municipio para todos os importadores usarem a mesma regra.
    Municipality.find_or_create_by!(code: normalized_code)
  end
end
