# app/controllers/api/v1/orders_controller.rb
module Api
  module V1
    class OrdersController < ApplicationController
      skip_before_action :authenticate_user, only: [:create]

      before_action :set_order, only: [:cancel, :show]

      # POST /orders
      def create
        if current_user
          cart = current_user.cart
        else
          guest_token = request.headers["X-Guest-Token"] || params[:guest_token]
          cart = Cart.find_by(guest_token: guest_token)
        end

        return render json: { error: "Cart is empty" }, status: :unprocessable_entity if cart.nil? || cart.cart_items.empty?

        # Create a simple order for guest or user
        order = Order.create!(
          user_id: current_user&.id, # nil for guest
          shop_id: cart.cart_items.first.product.shop_id,
          status: "pending",
          total_amount: cart.cart_items.sum { |i| i.unit_price * i.quantity }
        )

        # Copy cart items to order items
        cart.cart_items.each do |ci|
          OrderItem.create!(
            order_id: order.id,
            product_id: ci.product_id,
            quantity: ci.quantity,
            unit_price: ci.unit_price
          )
        end

        # Clear cart
        cart.cart_items.destroy_all

        render json: { message: "Checkout successful", order_id: order.id }, status: :created
      end

      private

      def set_order
        @order = Order.find(params[:id])
      end
    end
  end
end
