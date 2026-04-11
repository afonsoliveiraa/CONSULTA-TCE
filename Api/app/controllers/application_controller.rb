class ApplicationController < ActionController::API
  # O callback que o Rails chama automaticamente antes de cada action
  before_action :authenticate_api_key!

  include Pagy::Method

  private

  def authenticate_api_key!
    # 1. Busca no header
    provided_key = request.headers['X-API-KEY']
    
    # 2. Busca no ENV (que você configurou no .env)
    # Usei o .fetch para garantir que se a chave não existir no .env, o app avise
    actual_key = ENV['X_API_KEY']

    # 3. Comparação Segura
    is_valid = provided_key.present? && 
               actual_key.present? &&
               ActiveSupport::SecurityUtils.secure_compare(provided_key, actual_key)

    unless is_valid
      render_unauthorized
    end
  end

  def render_unauthorized
    render json: { 
      error: 'Unauthorized', 
      message: 'Invalid or missing API Key' 
    }, status: :unauthorized
  end

  # Método para padronizar o JSON de qualquer lista paginada
  def render_paginated(pagy, collection)
    render json: {
      # O .data_hash é o substituto moderno do metadata
      pagination: pagy.data_hash, 
      data: collection
    }
  end
end