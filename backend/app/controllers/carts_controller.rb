module Api
  module V1
    class CartsController < ApplicationController
      # Use the correct method name from ApplicationController
      before_action :authenticate_user

      def show
        cart = current_user.cart
        return render json: { cart: { shops: [] } } unless cart

        shops = cart.cart_items.includes(product: :shop).group_by { |item| item.product&.shop }.compact

        shops_data = shops.map do |shop, items|
          next unless shop

          {
            shop_id: shop.id,
            shop_name: shop.name,
            shop_open: shop.open,
            cross_comm_delivery: shop.respond_to?(:cross_comm_delivery) ? shop.cross_comm_delivery : false,
            cross_comm_charge: shop.respond_to?(:cross_comm_charge) ? shop.cross_comm_charge : 0,
            subtotal: items.sum { |i| i.unit_price.to_f * i.quantity },
            items: items.map do |i|
              product = i.product
              next unless product

              {
                cart_item_id: i.id,
                product_id: product.id,
                name: product.name,
                image_url: product.image_url,
                unit_price: i.unit_price.to_f,
                quantity: i.quantity,
                total_price: i.unit_price.to_f * i.quantity,
                stock: product.stock,
                active: product.status,
                preorder_delivery: product.preorder_delivery
              }
            end.compact
          }
        end.compact

        render json: {
          cart_id: cart.id,
          status: cart.status,
          item_count: cart.cart_items.sum(:quantity),
          grand_total: cart.cart_items.sum('unit_price * quantity'),
          shops: shops_data
        }
      end
    end
  end
end
