Rails.application.routes.draw do
  namespace :catalog do
    get "tce/endpoints", to: "tce#endpoints"
    get "tce/municipios", to: "tce#municipios"
    get "tce/imported_municipios", to: "tce#imported_municipios"
  end

  post "tce/query", to: "tce_queries#create"

  resources :biddings do
    collection do
      # Isso gera: GET /biddings/numero/:numero_processo
      get "numero/:numero_processo", action: :show_by_numero_processo
    end
  end
  resources :vehicles
  resources :contracts do
    collection do
      # Isso gera: GET /contracts/numero/:numero_contrato
      get 'numero/:numero_contrato', action: :show_by_numero_contrato
    end
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
