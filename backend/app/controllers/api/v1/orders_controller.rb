module Api
  module V1
    class OrdersController < ApplicationController
      before_action :authenticate_user

      def create
        cart = current_user.cart

        if cart.nil? || cart.cart_items.empty?
          return render json: { error: "Cart is empty" }, status: :unprocessable_entity
        end

        orders = []

        # 🔥 Group cart items by shop
        cart.cart_items.includes(product: :shop).group_by { |i| i.product.shop }.each do |shop, items|
          total_amount = items.sum { |i| i.quantity * i.unit_price }

          order = current_user.orders.create!(
            shop: shop,
            status: "pending",
            total_amount: total_amount,
            delivery_date: nil,
            delivery_time: nil,
            cross_comm_delivery: shop.open == false
          )

          items.each do |item|
            order.order_items.create!(
              product: item.product,
              quantity: item.quantity,
              unit_price: item.unit_price
            )
          end

          orders << order
        end

        # ✅ Clear cart after successful checkout
        cart.cart_items.destroy_all

        render json: {
          message: "Checkout successful",
          order_ids: orders.map(&:id)
        }, status: :created
      end

      # GET /api/v1/orders
      def index
        orders = current_user.orders.includes(:shop).order(created_at: :desc)
      
        render json: {
          orders: orders.as_json(include: { shop: { only: [:id, :name, :image_url] } }),
          has_ongoing: orders.ongoing.exists?
        }
      end
      
      # GET /api/v1/orders/:id
      def show
        order = current_user.orders.find(params[:id])
        render json: order
      end
    end
  end
end
