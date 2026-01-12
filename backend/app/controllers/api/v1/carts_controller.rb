module Api
  module V1
    class CartsController < ApplicationController
      before_action :authenticate_user

      def show
        cart = current_user.cart
        return render json: { shops: [] }, status: :ok if cart.nil?

        # Efficiently load data including the specific delivery group per item
        shops = cart.cart_items
                    .includes(:delivery_group, :variant, product: [:shop])
                    .group_by { |item| item.product.shop }

        result = shops.map do |shop, items|
          {
            shop_id: shop.id,
            shop_name: shop.name,
            items: items.map do |item|
              variant = item.variant
              
              # Use the delivery group actually associated with this specific cart item
              delivery_group = item.delivery_group

              {
                cart_item_id: item.id,
                product_id: item.product.id,
                variant_id: item.variant_id,
                name: item.product.name,
                image_url: item.product.image_url,
                quantity: item.quantity,
                stock: item.product.stock,
                unit_price: item.unit_price,
                total_price: item.unit_price * item.quantity,
                variant: variant ? { id: variant.id, name: variant.name, price: variant.price } : nil,
                delivery_group_name: delivery_group&.name,
                delivery_time: delivery_group&.ph_timestamp ? 
                  Time.at(delivery_group.ph_timestamp).in_time_zone("Asia/Manila").strftime("%-I:%M %p") : nil
              }
            end
          }
        end

        render json: { shops: result }, status: :ok
      end
    end
  end
end