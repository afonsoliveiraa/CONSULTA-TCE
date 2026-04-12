# app/controllers/contracts_controller.rb
class ContractsController < ApplicationController
  before_action :set_contract, only: %i[show]

  # GET /contracts
  def index
    scope = Contract.includes(:municipality)
    scope = scope.for_municipality_code(contract_params[:cod_municipio])

    @pagy, @contracts = pagy(:offset, scope)
    render_paginated(@pagy, @contracts)
  end

  # GET /contracts/1
  def show
    render json: @contract
  end

  # POST /contracts
  def create
    result = ContractService.import_multiple_files(Array(contract_params[:files]))

    if result.count.positive?
      render json: { message: result.message }, status: :created
    elsif result.duplicate
      render json: { message: result.message }, status: :unprocessable_entity
    else
      render json: { message: result.message }, status: :unprocessable_entity
    end
  end

  # GET /contracts/numero/:numero_contrato
  def show_by_numero_contrato
    scope = Contract.includes(:municipality).where(numero_contrato: params.expect(:numero_contrato))
    scope = scope.for_municipality_code(contract_params[:cod_municipio])

    if scope.any?
      @pagy, @contracts = pagy(:offset, scope)
      render_paginated(@pagy, @contracts)
    else
      render json: { error: "Nenhum contrato encontrado para este numero" }, status: :not_found
    end
  end

  private

  def set_contract
    @contract = Contract.find(params[:id])
  end

  def contract_params
    # O controller preserva o nome atual do parametro para nao quebrar o frontend.
    params.permit(:numero_contrato, :cod_municipio, :files, files: [])
  end
end
