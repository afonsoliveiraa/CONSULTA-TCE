class VehiclesController < ApplicationController
  before_action :set_vehicle, only: %i[show]

  # GET /vehicles
  def index
    scope = Vehicle.includes(:municipality)
    scope = scope.for_municipality_code(vehicle_params[:cod_municipio])

    if vehicle_params[:placa_ou_renavam].present?
      normalized_query = vehicle_params[:placa_ou_renavam].to_s.strip
      scope = scope.where("placa = :query OR codigo_renavam = :query", query: normalized_query)
    end

    @pagy, @vehicles = pagy(:offset, scope)
    render_paginated(@pagy, @vehicles)
  end

  # GET /vehicles/:id
  def show
    render json: @vehicle
  end

  # POST /vehicles
  def create
    result = VehicleService.import_multiple_files(Array(vehicle_params[:files]))

    if result.count.positive?
      render json: { message: result.message }, status: :created
    elsif result.duplicate
      render json: { message: result.message }, status: :unprocessable_entity
    else
      render json: { message: result.message }, status: :unprocessable_entity
    end
  end

  private

  def set_vehicle
    @vehicle = Vehicle.find(params[:id])
  end

  def vehicle_params
    params.permit(:cod_municipio, :placa_ou_renavam, :files, files: [])
  end
end
