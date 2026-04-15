class VehiclesController < ApplicationController
  before_action :set_vehicle, only: %i[ show ]

  # GET /vehicles
  def index
    scope = Vehicle.all

    if params[:placa_ou_renavam].present?
      term = "%#{params[:placa_ou_renavam]}%"
      # Busca por placa OU renavam usando LIKE
      scope = scope.where("placa LIKE :t OR codigo_renavam LIKE :t", t: term)
    end

    if params[:cod_municipio].present?
      scope = scope.where(cod_municipio: params[:cod_municipio])
    end

    # O Pagy costuma usar params[:page] por padrão
    @pagy, @vehicles = pagy(scope)
    render_paginated(@pagy, @vehicles)
  end

  # GET /vehicles/1
  def show
    render json: @vehicle
  end

  # POST /vehicles
  def create
    files_count = VehicleService.import_multiple_files(Array(vehicle_params[:files]))

    if files_count > 0
      render json: { message: "#{files_count} contratos importados com sucesso." }, status: :created
    else
      render json: { message: "Nenhum contrato importado." }, status: :unprocessable_entity
    end
  end

  def show_by_placa_renavam
    # Querry dinâmica para buscar por placa ou renavam, usando o mesmo parâmetro "numero" da rota
    scope = Vehicle.where("placa = :n OR codigo_renavam = :n", n: params[:numero])
    
    if params[:cod_municipio].present?
      scope = scope.where(cod_municipio: params[:cod_municipio])
    end

    if scope.exists?
      @pagy, @vehicles = pagy(scope.order(created_at: :desc))
      render_paginated(@pagy, @vehicles)
    else
      render json: { error: "Nenhum veículo encontrado" }, status: :not_found
    end
  end

  def show_municipios_importados
    @municipios = Vehicle.distinct.order(:cod_municipio).pluck(:cod_municipio)
    render json: { municipios: @municipios }
  end


  private
    # Use callbacks to share common setup or constraints between actions.
    def set_vehicle
      @vehicle = Vehicle.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def vehicle_params
      params.permit(:cod_municipio, :placa_ou_renavam, :files, files: [])
    end
end
