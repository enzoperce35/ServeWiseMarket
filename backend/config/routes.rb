Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Auth
      post '/signup', to: 'users#create'
      post '/login', to: 'sessions#create'
      delete '/logout', to: 'sessions#destroy'
      get '/me', to: 'users#me'
      get '/cart', to: 'carts#show'

      # Public Products (for buyers)
      resources :products, only: [:index, :show] do
        # Nested Ratings
        resources :ratings, only: [:index, :create], controller: 'product_ratings'
      end

      # Public shops for buyers
      resources :shops, only: [:show]

      
      resource :cart, only: [:show]
      resources :cart_items, only: [:create, :update, :destroy]
      
      # ✅ Buyer Orders (ADD cancel here)
      resources :orders, only: [:create, :index, :show] do
        member do
          patch :cancel
        end
      end

      resources :delivery_groups, only: [:index, :update] do
        member do
          patch :update   # <-- add this
        end
        collection do
          post :find_or_create
        end
      end
  
      resources :product_delivery_groups, only: [:create] do
        member do
          put :activate
          put :deactivate
        end
      end

      # Seller-specific products (dashboard)
      namespace :seller do
        resource :shop, only: [:show, :create, :update]
        resources :products, only: [:index, :create, :update, :destroy]
        resources :shop_payment_accounts, only: [:destroy]
        resources :orders, only: [:index] do
          member do
            patch :confirm
          end
        end
        # Optional: future shop settings routes
        # resources :shops, only: [:show, :update]
      end
    end
  end
end
