Rails.application.routes.draw do
  resources :vehicles do
    collection do
      get 'municipios-importados', action: :show_municipios_importados
    end
  end

  # No routes.rb
  resources :analyses, only: [] do
    collection do
      post :analyses_ne # Isso cria a rota POST /analyses/analyses_ne
    end
  end

  # Api TCE dinamica
  # Rota para pegar os parâmetros e documentação
  get 'tce/endpoints', to: 'tce_api#endpoints'
  get 'tce/municipios', to: 'tce_api#municipios'
  get 'tce/definitions/*endpoint', to: 'tce_api#definitions'
  # Rota para buscar os dados reais
  get 'tce/*endpoint', to: 'tce_api#fetch'

  resources :biddings do  
    collection do
      # Isso gera: GET /biddings/numero/:numero_processo
      get 'municipios-importados', action: :show_municipios_importados
    end
  end

  resources :contracts do
    collection do
      # Isso gera: GET /contracts/numero/:numero_contrato
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
