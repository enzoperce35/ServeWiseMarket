# app/controllers/api/v1/carts_controller.rb
module Api
  module V1
    class CartsController < ApplicationController
      before_action :authenticate_user

      # GET /api/v1/cart
      def show
        cart = current_user.cart

        if cart.nil?
          render json: { shops: [] }, status: :ok
          return
        end

        # Group items by shop
        shops = cart.cart_items.includes(product: :variants).group_by { |item| item.product.shop }

        result = shops.map do |shop, items|
          {
            shop_id: shop.id,
            shop_name: shop.name,
            items: items.map do |item|
              variant = item.variant # assuming you store variant_id in cart_item

              {
                cart_item_id: item.id,
                product_id: item.product.id,
                variant_id: item.variant_id,
                name: item.product.name,
                image_url: item.product.image_url,
                quantity: item.quantity,
                total_price: item.unit_price * item.quantity,
                variant: variant ? {
                  id: variant.id,
                  name: variant.name,
                  price: variant.price
                } : nil
              }
            end
          }
        end

        render json: { shops: result }, status: :ok
      end
    end
  end
end
