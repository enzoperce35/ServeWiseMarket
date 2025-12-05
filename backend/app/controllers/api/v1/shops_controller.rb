module Api
  module V1
    class ShopsController < ApplicationController
      # Public access, no authentication required
      skip_before_action :authenticate_user, raise: false

      def show
        # Fetch shop by ID and include products and owner
        shop = Shop.includes(:products, :user).find(params[:id])

        render json: {
          shop: {
            id: shop.id,
            name: shop.name,
            description: shop.description,
            owner: { id: shop.user.id, name: shop.user.name }
          },
          products: shop.products.map do |p|
            {
              id: p.id,
              name: p.name,
              price: p.price,
              stock: p.stock,
              image_url: p.image_url
            }
          end
        }, status: :ok

      rescue ActiveRecord::RecordNotFound
        render json: { error: "Shop not found" }, status: :not_found
      end
    end
  end
end
