# app/controllers/api/v1/carts_controller.rb
module Api
  module V1
    class CartsController < ApplicationController
      before_action :authenticate_user

      def show
        cart = current_user.cart
        return render json: { shops: [] }, status: :ok if cart.nil?

        shops = cart.cart_items.includes(product: [:variants, :delivery_groups]).group_by { |item| item.product.shop }

        result = shops.map do |shop, items|
          {
            shop_id: shop.id,
            shop_name: shop.name,
            items: items.map do |item|
              variant = item.variant

              # Grab the first active delivery group for the product (or nil)
              delivery_group = item.product.delivery_groups.active.first

              {
                cart_item_id: item.id,
                product_id: item.product.id,
                variant_id: item.variant_id,
                name: item.product.name,
                image_url: item.product.image_url,
                quantity: item.quantity,
                total_price: item.unit_price * item.quantity,
                variant: variant ? { id: variant.id, name: variant.name, price: variant.price } : nil,
                delivery_group_name: delivery_group&.name,
                delivery_time: delivery_group&.ph_timestamp ? Time.at(delivery_group.ph_timestamp).strftime("%-I:%M %p") : nil
              }
            end
          }
        end

        render json: { shops: result }, status: :ok
      end
    end
  end
end
