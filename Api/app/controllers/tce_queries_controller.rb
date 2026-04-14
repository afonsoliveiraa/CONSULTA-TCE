class TceQueriesController < ApplicationController
  rescue_from TceCe::Error, with: :render_tce_error

  # Orquestra a consulta dinamica da aba API TCE mantendo o controller fino.
  def create
    payload = tce_query_params
    endpoint = TceCe::ResourceCatalog.find!(payload.fetch(:endpointKey))
    pagination = TceCe::PaginationQuery.new(page: payload[:page], page_size: payload[:pageSize])
    query_parameters = normalized_query_parameters(payload.fetch(:parameters, {}), payload[:municipalityCode])
    envelope = TceCe::Client.new.get_resource_page(
      resource: endpoint.key,
      pagination: pagination,
      query_parameters: query_parameters
    )

    render json: serialize_result(endpoint, envelope, payload)
  end

  private

  def tce_query_params
    params.permit(
      :municipalityCode,
      :municipalityName,
      :endpointKey,
      :page,
      :pageSize,
      parameters: {}
    )
  end

  # O codigo do municipio entra sempre no payload central para simplificar o formulario do frontend.
  def normalized_query_parameters(parameters, municipality_code)
    parameters.to_h.compact_blank.merge("codigo_municipio" => municipality_code.to_s)
  end

  def serialize_result(endpoint, envelope, payload)
    {
      endpointKey: endpoint.key,
      endpointPath: endpoint.path,
      municipalityCode: payload[:municipalityCode].to_s,
      municipalityName: payload[:municipalityName].to_s,
      sourceUrl: envelope.source_url,
      columns: collect_columns(envelope.items),
      items: envelope.items.map { |item| stringify_object(item) },
      metadata: stringify_object(envelope.metadata),
      pagination: {
        page: envelope.page,
        pageSize: envelope.page_size,
        totalItems: envelope.total_items,
        totalPages: envelope.total_pages,
        # O frontend trabalha sempre com boolean aqui, mesmo quando o TCE não devolve esse campo explicitamente.
        hasMorePages: envelope.metadata.key?("hasMorePages") ? ActiveModel::Type::Boolean.new.cast(envelope.metadata["hasMorePages"]) : false
      }
    }
  end

  def collect_columns(items)
    seen_columns = {}

    items.each do |item|
      item.each_key do |key|
        seen_columns[key.to_s] ||= true
      end
    end

    seen_columns.keys
  end

  def stringify_object(object)
    object.each_with_object({}) do |(key, value), serialized|
      serialized[key.to_s] = value.nil? ? nil : value.to_s
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
