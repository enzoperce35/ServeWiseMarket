module Api
  module V1
    class OrdersController < ApplicationController
      before_action :authenticate_user
      before_action :set_order, only: [:cancel]

      def create
        cart = current_user.cart
      
        if cart.nil? || cart.cart_items.empty?
          return render json: { error: "Cart is empty" }, status: :unprocessable_entity
        end
      
        # Clear cart after checkout
        cart.cart_items.destroy_all
      
        render json: {
          message: "Checkout successful",
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

      def cancel
        unless @order.user_id == current_user.id
          return render json: { error: "Not authorized" }, status: :forbidden
        end
    
        unless @order.status == "pending"
          return render json: { error: "Order can no longer be cancelled" }, status: :unprocessable_entity
        end
    
        @order.update!(status: "cancelled")
    
        render json: { message: "Order cancelled", status: @order.status }
      end
      
      # GET /api/v1/orders/:id
      def show
        order = current_user.orders.find(params[:id])
        render json: order
      end

      private

      def set_order
        @order = Order.find(params[:id])
      end
    end
  end
end
