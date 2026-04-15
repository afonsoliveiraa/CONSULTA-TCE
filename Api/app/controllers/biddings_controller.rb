class BiddingsController < ApplicationController
  before_action :set_bidding, only: %i[ show ]

  # GET /biddings
  def index
    scope = Bidding.all
    # Filtra por município se o parâmetro estiver presente
    scope = scope.where(cod_municipio: params[:cod_municipio]) if params[:cod_municipio].present?

    # Usa a gem pagy para paginar os resultados
    @pagy, @biddings = pagy(scope)
    # utiliza a função do ApplicationController para renderizar a resposta paginada
    render_paginated(@pagy, @biddings)
  end

  # GET /biddings/1
  def show
    render json: @bidding
  end

  # POST /biddings
  def create
    bidding = BiddingService.import_multiple_files(Array(bidding_params[:files]))

    if bidding > 0
      render json: { message: "#{bidding} licitações importadas com sucesso." }, status: :created
    else
      render json: { message: "Nenhuma licitação importada." }, status: :unprocessable_entity
    end
  end

  # GET /biddings/processo/:numero_processo
  def show_by_numero_processo
    scope = Bidding.where(numero_processo: params[:numero_processo])
    
    # Filtro adicional por município se presente
    if params[:cod_municipio].present?
      scope = scope.where(cod_municipio: params[:cod_municipio])
    end

    if scope.any?
      @pagy, @biddings = pagy(scope)
      render_paginated(@pagy, @biddings)
    else
      render json: { error: "Nenhuma licitação encontrada" }, status: :not_found
    end
  end

  # GET /biddings/municipios-importados
  def show_municipios_importados
    @municipios = Bidding.distinct.order(:cod_municipio).pluck(:cod_municipio)
    render json: { municipios: @municipios }
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_bidding
      @bidding = Bidding.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def bidding_params
      params.permit( :cod_municipio, :numero_processo, :file, files: [] )
    end
end 
