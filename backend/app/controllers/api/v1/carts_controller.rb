# app/controllers/api/v1/carts_controller.rb
module Api
  module V1
    class CartsController < ApplicationController
      skip_before_action :authenticate_user
      before_action :set_cart

      # GET /cart
      def show
        return render json: { shops: [] }, status: :ok if @cart.nil?

        shops = @cart.cart_items
                     .includes(:delivery_group, :variant, product: [:shop])
                     .group_by { |item| item.product.shop }

        result = shops.map do |shop, items|
          {
            shop_id: shop.id,
            shop_name: shop.name,
            items: items.map do |item|
              variant = item.variant
              delivery_group = item.delivery_group

              {
                cart_item_id: item.id,
                product_id: item.product.id,
                variant_id: item.variant_id,
                delivery_group_id: item.delivery_group_id,
                name: item.product.name,
                image_url: item.product.image_url,
                quantity: item.quantity,
                stock: item.product.stock,
                unit_price: item.unit_price,
                total_price: item.unit_price * item.quantity,
                variant: variant ? { id: variant.id, name: variant.name, price: variant.price } : nil,
                delivery_group_name: delivery_group&.name || "Now",
                delivery_time: delivery_group&.ph_timestamp ? 
                  Time.at(delivery_group.ph_timestamp).in_time_zone("Asia/Manila").strftime("%-I:%M %p") : nil
              }
            end
          }
        end

        render json: { shops: result }, status: :ok
      end

      private

      def set_cart
        if current_user
          @cart = current_user.cart || current_user.create_cart!
        else
          guest_token = request.headers["X-Guest-Token"] || params[:guest_token]
          @cart = Cart.find_or_create_by!(guest_token: guest_token)
        end
      end
    end
  end
end
