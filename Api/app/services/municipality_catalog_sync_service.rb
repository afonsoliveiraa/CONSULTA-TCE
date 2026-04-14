class MunicipalityCatalogSyncService
  def self.call
    new.call
  end

  def call
    client = TceCe::Client.new
    pagination = TceCe::PaginationQuery.new(page: 1, page_size: 250)
    envelope = client.get_resource_page(resource: "municipios", pagination: pagination, query_parameters: {})

    synced_count = 0

    Municipality.transaction do
      envelope.items.each do |item|
        municipality_code = (item["codigo_municipio"] || item["codigoMunicipio"]).to_s.strip
        municipality_name = (item["nome_municipio"] || item["nomeMunicipio"]).to_s.strip
        next if municipality_code.blank? || municipality_name.blank?

        municipality = Municipality.find_or_initialize_by(code: municipality_code)
        municipality.name = municipality_name
        municipality.save! if municipality.changed?
        synced_count += 1
      end
    end

    synced_count
  end
end
