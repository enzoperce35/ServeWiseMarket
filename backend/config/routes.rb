Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Auth
      post '/signup', to: 'users#create'
      post '/login', to: 'sessions#create'
      delete '/logout', to: 'sessions#destroy'
      get '/me', to: 'users#me'

      # Public Products (for buyers)
      resources :products, only: [:index, :show] do
        # Nested Ratings
        resources :ratings, only: [:index, :create], controller: 'product_ratings'
      end

      # Public shops for buyers
      resources :shops, only: [:show]

      resource :cart, only: [:show]
      resources :cart_items, only: [:create, :update, :destroy]

      # Seller-specific products (dashboard)
      namespace :seller do
        resource :shop, only: [:show, :create, :update]
        resources :products, only: [:index, :create, :update, :destroy]
        # Optional: future shop settings routes
        # resources :shops, only: [:show, :update]
      end
    end
  end
end
