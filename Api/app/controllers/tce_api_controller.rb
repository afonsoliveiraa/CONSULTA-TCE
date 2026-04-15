class TceApiController < ApplicationController
  def endpoints
    render json: { endpoints: tce_service.endpoints_catalog }
  end

  def definitions
    endpoint_spec = tce_service.definitions_for(params[:endpoint])

    if endpoint_spec
      render json: {
        summary: endpoint_spec["summary"],
        parameters: endpoint_spec["parameters"] || []
      }
    else
      render json: { error: "Definicoes para '#{params[:endpoint]}' nao encontradas." }, status: :not_found
    end
  end

  def fetch
    render json: tce_service.fetch(params[:endpoint], request.query_parameters)
  rescue TceService::UnsupportedEndpointError
    render json: { error: "Endpoint '#{params[:endpoint]}' nao suportado." }, status: :not_found
  rescue TceService::UpstreamError => error
    status = error.status_code.present? ? :bad_gateway : :service_unavailable
    render json: { error: error.message, code: error.status_code }, status: status
  end

  private

  def tce_service
    @tce_service ||= TceService.new
  end
end
