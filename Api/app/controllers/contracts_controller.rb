# app/controllers/contracts_controller.rb
class ContractsController < ApplicationController
  before_action :set_contract, only: %i[ show ]

  # GET /contracts
  def index
    # Usa a gem pagy para paginar os resultados
    @pagy, @contracts = pagy(:offset, Contract.all)
    # utiliza a função do ApplicationController para renderizar a resposta paginada
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
    
    if params[:cod_municipio].present?
      scope = Contract.where(numero_contrato: params.expect(:numero_contrato), cod_municipio: params.expect(:cod_municipio))
    else  
      scope = Contract.where(numero_contrato: params.expect(:numero_contrato))
    end

    if scope.any?
      @pagy, @contracts = pagy(scope)
      render_paginated(@pagy, @contracts)
    else
      render json: { error: "Nenhum contrato encontrado para este número" }, status: :not_found
    end
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