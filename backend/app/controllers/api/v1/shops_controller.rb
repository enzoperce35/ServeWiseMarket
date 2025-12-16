module Api
  module V1
    class ShopsController < ApplicationController
      include ShopStatusUpdater

      skip_before_action :authenticate_user, raise: false

      def show
        shop = Shop.includes(:user, :products).find(params[:id])

        # Restore previous behavior
        update_shop_status(shop)

        render json: {
          shop: {
            id: shop.id,
            name: shop.name,
            description: shop.description,
            image_url: shop.image_url,
            open: shop.open,
            user: {
              id: shop.user.id,
              name: shop.user.name,
              contact_number: shop.user.contact_number,
              block: shop.user.block,
              lot: shop.user.lot,
              street: shop.user.street,
              phase: shop.user.phase,
              community: shop.user.community
            },
            products: shop.products.map do |p|
              {
                id: p.id,
                name: p.name,
                price: p.price,
                stock: p.stock,
                image_url: p.image_url,
                status: p.status,       # bring back 'status' field
                featured: p.featured
              }
            end
          }
        }, status: :ok

      rescue ActiveRecord::RecordNotFound
        render json: { shop: nil }, status: :not_found
      end
    end
  end
end
