module Api
  module V1
    class ShopsController < ApplicationController
      include ShopStatusUpdater

      skip_before_action :authenticate_user, raise: false

      def show
        shop = Shop.includes(:user, :products).find_by(id: params[:id])

        unless shop
          render json: { shop: nil }, status: :not_found and return
        end

        render json: {
          shop: {
            id: shop.id,
            name: shop.name,
            description: shop.description,
            image_url: shop.image_url,
            open: shop.open_now?,
            cross_comm_charge: shop.cross_comm_charge,
            cross_comm_minimum: shop.cross_comm_minimum,
            user: shop.user ? {
              id: shop.user.id,
              name: shop.user.name,
              contact_number: shop.user.contact_number,
              block: shop.user.block,
              lot: shop.user.lot,
              street: shop.user.street,
              phase: shop.user.phase,
              community: shop.user.community
            } : nil,
            products: shop.products.map do |p|
              {
                id: p.id,
                name: p.name,
                price: p.price,
                stock: p.stock,
                image_url: p.image_url,
                status: p.status,
                featured: p.featured,
                preorder_delivery: p.preorder_delivery,
                delivery_date: p.delivery_date,
                delivery_time: p.delivery_time,
              }
            end
          }
        }, status: :ok
      end
    end
  end
end
