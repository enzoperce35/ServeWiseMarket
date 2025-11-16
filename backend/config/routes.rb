Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post '/signup', to: 'users#create'      # signup endpoint
      post '/login', to: 'sessions#create'    # login endpoint
      delete '/logout', to: 'sessions#destroy' # logout endpoint
    end
  end
end
