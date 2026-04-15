class AnalysesController < ApplicationController

    def analyses_ne
      # 1. Chama o service para processar o arquivo e obter os resultados
      scope = AnalysesService.fileprocess(analysis_params[:file], analysis_params[:error_lines])

      @pagy, @analyses = pagy(scope, page: current_page)
      render_paginated(@pagy, @analyses)
    end

    private 

    # Permite apenas o parâmetro de linhas com e erro e o próprio arquivo
    def analysis_params
      params.permit( :file, error_lines: [] )
    end

    def current_page
      page_number = params.dig(:page, :number) || params[:page]
      page_number = page_number.to_i

      page_number.positive? ? page_number : 1
    end

end