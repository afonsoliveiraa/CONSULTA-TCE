class TceApiController < ApplicationController
  rescue_from ArgumentError, with: :render_invalid_request
  rescue_from TceApiService::ExternalApiError, with: :render_external_api_error

  def endpoints
    render json: { endpoints: TceApiService.catalog }
  end

  def municipios
    render json: { data: TceApiService.municipalities }
  end

  def definitions
    definition = TceApiService.definitions(params[:endpoint])
    return render json: { error: "Definições para '/#{params[:endpoint]}' não encontradas." }, status: :not_found unless definition

    render json: definition
  end

  def fetch
    render json: TceApiService.query(params[:endpoint], request.query_parameters)
  end

  private

  def render_invalid_request(error)
    render json: { error: error.message }, status: :not_found
  end

  def render_external_api_error(error)
    render json: { error: error.message, details: error.details }, status: error.code
  end
end
