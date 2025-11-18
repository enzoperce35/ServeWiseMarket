Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Auth
      post '/signup', to: 'users#create'
      post '/login', to: 'sessions#create'
      delete '/logout', to: 'sessions#destroy'

      # Products
      resources :products, only: [:index, :show, :create]
    end
  end
end
