class BiddingsController < ApplicationController
  before_action :set_bidding, only: %i[show]

  # GET /biddings
  def index
    scope = Bidding.includes(:municipality)
    scope = scope.for_municipality_code(bidding_params[:codigo_municipio] || bidding_params[:cod_municipio])

    @pagy, @biddings = pagy(:offset, scope)
    render_paginated(@pagy, @biddings)
  end

  # GET /biddings/1
  def show
    render json: @bidding
  end

  # POST /biddings
  def create
    result = BiddingService.import_multiple_files(Array(bidding_params[:files]))

    if result.count.positive?
      render json: { message: result.message }, status: :created
    elsif result.duplicate
      render json: { message: result.message }, status: :unprocessable_entity
    else
      render json: { message: result.message }, status: :unprocessable_entity
    end
  end

  def show_by_numero_processo
    scope = Bidding.includes(:municipality).where(numero_processo: params[:numero_processo])
    scope = scope.for_municipality_code(bidding_params[:codigo_municipio] || bidding_params[:cod_municipio])

    if scope.any?
      @pagy, @biddings = pagy(:offset, scope)
      render_paginated(@pagy, @biddings)
    else
      render json: { error: "Nenhuma licitacao encontrada para este numero de processo" }, status: :not_found
    end
  end

  private

  def set_bidding
    @bidding = Bidding.find(params.expect(:id))
  end

  def bidding_params
    # Aceita os dois nomes de parametro para manter compatibilidade com chamadas antigas.
    params.permit(:cod_municipio, :codigo_municipio, :numero_processo, :file, files: [])
  end
end
