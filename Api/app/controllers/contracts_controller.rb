# app/controllers/contracts_controller.rb
class ContractsController < ApplicationController
  before_action :set_contract, only: %i[ show ]

  # GET /contracts
  def index
    scope = Contract.all
    # Filtra por município se o parâmetro estiver presente
    scope = scope.where(cod_municipio: params[:cod_municipio]) if params[:cod_municipio].present?
    
    @pagy, @contracts = pagy(scope)
    render_paginated(@pagy, @contracts)
  end

  # GET /contracts/1
  def show
    render json: @contract
  end

  # POST /contracts
  def create
    # Chama o service para importar os contratos a partir dos arquivos enviados
    files_count = ContractService.import_multiple_files(Array(contract_params[:files]))

    # Como a resposta do service é o número total de contratos importados, dá para criar a response
    if files_count > 0
      render json: { message: "#{files_count} contratos importados com sucesso." }, status: :created
    else
      render json: { message: "Nenhum contrato importado." }, status: :unprocessable_entity
    end
  end

  # GET /contracts/numero/:numero_contrato
  def show_by_numero_contrato
    scope = Contract.where(numero_contrato: params[:numero_contrato])
    
    if params[:cod_municipio].present?
      scope = scope.where(cod_municipio: params[:cod_municipio])
    end

    if scope.any?
      @pagy, @contracts = pagy(scope)
      render_paginated(@pagy, @contracts)
    else
      render json: { error: "Nenhum contrato encontrado" }, status: :not_found
    end
  end

  def show_municipios_importados
    @municipios = Contract.distinct.pluck(:cod_municipio)
    render json: { municipios: @municipios }
  end

  private

  def set_contract
    @contract = Contract.find(params[:id])
  end

  def contract_params
    # CORREÇÃO: Permitindo :files (objeto único) e files: [] (array)
    # Isso resolve o erro de Unpermitted parameter dependendo de como o arquivo é enviado.
    params.permit(:numero_contrato, :cod_municipio, :files, files: [])
  end
end