# app/controllers/api/v1/seller/orders_controller.rb
module Api
  module V1
    module Seller
      class OrdersController < ApplicationController
        before_action :authenticate_user
        before_action :set_order, only: [:confirm]

        # GET /api/v1/seller/orders?shop_id=13
        def index
          shop_id = params[:shop_id]
          shop = Shop.find_by(id: shop_id, user_id: current_user.id)

          unless shop
            return render json: { error: "Shop not found or not authorized" }, status: :forbidden
          end

          orders = shop.orders.includes(:order_items, :user, order_items: :product).order(created_at: :desc)

          render json: {
            orders: orders.as_json(
              include: {
                user: { only: [:id, :name] },
                order_items: {
                  include: { product: { only: [:id, :name] } },
                  only: [:id, :quantity, :unit_price]
                }
              }
            )
          }
        end

        # PATCH /api/v1/seller/orders/:id/confirm
        def confirm
          authorize_shop!
          return if performed?

          unless @order.status == "pending"
            return render json: { error: "Order cannot be confirmed" }, status: :unprocessable_entity
          end

          ActiveRecord::Base.transaction do
            @order.order_items.each do |item|
              product = item.product
              if product.stock < item.quantity
                raise ActiveRecord::Rollback, "Insufficient stock for #{product.name}"
              end
              product.update!(stock: product.stock - item.quantity)
            end
            @order.update!(status: "confirmed")
          end

          render json: { message: "Order confirmed", order_id: @order.id, status: @order.status }
        rescue => e
          render json: { error: e.message }, status: :unprocessable_entity
        end

        private

        def set_order
          @order = Order.find(params[:id])
        end

        def authorize_shop!
          unless @order.shop.user_id == current_user.id
            render json: { error: "Not authorized" }, status: :forbidden
            return
          end
        end
      end
    end
  end
end
