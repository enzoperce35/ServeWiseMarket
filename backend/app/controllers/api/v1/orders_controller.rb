# app/controllers/api/v1/orders_controller.rb
module Api
  module V1
    class OrdersController < ApplicationController
      before_action :authenticate_user!

      def create
        orders = CheckoutService.new(current_user).call

        render json: {
          message: "Order placed successfully",
          orders: orders.map { |order| order_payload(order) }
        }, status: :created
      rescue StandardError => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      private

      def order_payload(order)
        {
          id: order.id,
          shop: {
            id: order.shop.id,
            name: order.shop.name
          },
          total_amount: order.total_amount,
          status: order.status,
          created_at: order.created_at,
          items: order.order_items.map do |item|
            {
              product_id: item.product_id,
              name: item.product.name,
              quantity: item.quantity,
              unit_price: item.unit_price
            }
          end
        }
      end
    end
  end
end
