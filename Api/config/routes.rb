Rails.application.routes.draw do
  resources :vehicles do
    collection do
      get 'municipios-importados', action: :show_municipios_importados
      get 'placa-renavam/:numero', action: :show_by_placa_renavam
    end
  end

  get 'analyses-ne', action: :analyses_ne, controller: 'analyses'

  # Api TCE dinamica
  # Rota para pegar os parâmetros e documentação
  get 'tce/definitions/*endpoint', to: 'tce_api#definitions'
  # Rota para buscar os dados reais
  get 'tce/*endpoint', to: 'tce_api#fetch'

  resources :biddings do  
    collection do
      # Isso gera: GET /biddings/numero/:numero_processo
      get 'numero/:numero_processo', action: :show_by_numero_processo
      get 'municipios-importados', action: :show_municipios_importados
    end
  end

  resources :contracts do
    collection do
      # Isso gera: GET /contracts/numero/:numero_contrato
      get 'numero/:numero_contrato', action: :show_by_numero_contrato
      get 'municipios-importados', action: :show_municipios_importados
    end
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
