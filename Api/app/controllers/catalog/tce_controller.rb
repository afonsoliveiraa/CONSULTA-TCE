module Catalog
  # Expõe o catálogo e a lista de municípios no contrato esperado pelo frontend.
  class TceController < ApplicationController
    rescue_from TceCe::Error, with: :render_tce_error

    def endpoints
      endpoints = TceCe::ResourceCatalog.resources.values
        .sort_by { |resource| [resource.category.to_s, resource.key.to_s] }
        .map(&:to_frontend_hash)

      render json: endpoints
    end

    def municipios
      client = TceCe::Client.new
      pagination = TceCe::PaginationQuery.new(page: 1, page_size: 250)
      envelope = client.get_resource_page(resource: "municipios", pagination: pagination, query_parameters: {})

      municipalities = envelope.items.filter_map do |item|
        code = item["codigo_municipio"] || item["codigoMunicipio"]
        name = item["nome_municipio"] || item["nomeMunicipio"]
        next if code.blank? || name.blank?

        {
          code: code.to_s,
          name: name.to_s
        }
      end

      render json: municipalities
    end

    def imported_municipios
      municipalities = imported_municipalities_scope
        .where.not(name: [nil, ""])
        .distinct
        .order(:name, :code)
        .map do |municipality|
          {
            code: municipality.code.to_s,
            name: municipality.name.to_s
          }
        end

      render json: municipalities
    end

    private

    def imported_municipalities_scope
      case params[:resource].to_s
      when "contracts"
        Municipality.joins(:contracts)
      when "biddings"
        Municipality.joins(:biddings)
      when "vehicles"
        Municipality.joins(:vehicles)
      else
        Municipality.left_outer_joins(:contracts, :biddings, :vehicles)
          .where("contracts.id IS NOT NULL OR biddings.id IS NOT NULL OR vehicles.id IS NOT NULL")
      end
    end

    def render_tce_error(error)
      case error
      when TceCe::ResourceNotConfiguredError, TceCe::UpstreamResourceNotFoundError
        render json: { error: "Not Found", message: error.message }, status: :not_found
      when TceCe::UpstreamRequestError
        status = error.status_code == 400 ? :bad_request : :bad_gateway
        render json: { error: Rack::Utils::HTTP_STATUS_CODES[Rack::Utils.status_code(status)], message: error.message }, status: status
      when TceCe::UpstreamConnectivityError
        render json: { error: "Bad Gateway", message: error.message }, status: :bad_gateway
      else
        render json: { error: "Internal Server Error", message: error.message }, status: :internal_server_error
      end
    end
  end
end
