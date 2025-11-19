Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Auth
      post '/signup', to: 'users#create'
      post '/login', to: 'sessions#create'
      delete '/logout', to: 'sessions#destroy'
      get '/me', to: 'users#me'

      # Products
      resources :products, only: [:index, :show, :create] do
        # Nested Ratings
        resources :ratings, only: [:index, :create], controller: 'product_ratings'
      end
    end
  end
end
