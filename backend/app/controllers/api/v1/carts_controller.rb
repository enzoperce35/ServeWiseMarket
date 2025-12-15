# app/controllers/api/v1/carts_controller.rb
module Api
  module V1
    class CartsController < ApplicationController
      before_action :authenticate_user

      def show
        cart = current_user.cart
        return render json: { shops: [] } unless cart

        # Group items by shop
        grouped = cart.cart_items.includes(product: :shop).group_by { |item| item.product.shop }

        cart_json = {
          cart_id: cart.id,
          item_count: cart.cart_items.sum(:quantity),
          grand_total: cart.cart_items.sum { |item| item.quantity * item.product.price },
          shops: grouped.map do |shop, items|
            {
              shop_id: shop.id,
              shop_name: shop.name,
              shop_open: shop.open,
              subtotal: items.sum { |item| item.quantity * item.product.price },
              items: items.map do |item|
                {
                  cart_item_id: item.id,
                  product_id: item.product.id,
                  name: item.product.name,
                  image_url: item.product.image_url,
                  unit_price: item.product.price,
                  quantity: item.quantity,
                  total_price: item.quantity * item.product.price,
                  stock: item.product.stock,
                  active: item.product.status,
                  preorder_delivery: item.product.preorder_delivery
                }
              end
            }
          end
        }

        render json: cart_json
      end
    end
  end
end
