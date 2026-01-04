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
      
        orders = []
      
        # Group cart items by shop
        cart.cart_items.includes(product: :shop).group_by { |i| i.product.shop }.each do |shop, items|
          subtotal = items.sum { |i| i.quantity * i.unit_price }
      
          # Cross-community logic
          cross_fee = 0
          if current_user.community != shop.community
            cross_fee = subtotal < shop.cross_comm_minimum ? shop.cross_comm_charge : 0
          end
      
          order = current_user.orders.create!(
            shop: shop,
            status: "pending",
            total_amount: subtotal + cross_fee,
            delivery_date: nil,
            delivery_time: nil,
            cross_comm_delivery: cross_fee.positive?,
            cross_comm_charge: cross_fee
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
      
        # Clear cart after checkout
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
