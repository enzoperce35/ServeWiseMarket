module Api
  module V1
    module Seller
      class ProductsController < ApplicationController
        before_action :authenticate_user
        before_action :require_shop
        before_action :set_product, only: [:update, :destroy]

        # GET /api/v1/seller/products
        def index
          products = @shop.products.order(created_at: :desc)
          render json: products, status: :ok
        end

        # POST /api/v1/seller/products
        def create
          product = @shop.products.build(product_params)

          # Set default status if not provided
          product.status ||= "active"
          product.availability_type ||= "on_hand"

          if product.save
            render json: product, status: :created
          else
            render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # PUT/PATCH /api/v1/seller/products/:id
        def update
          if @product.update(product_params)
            render json: @product, status: :ok
          else
            render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # DELETE /api/v1/seller/products/:id
        def destroy
          @product.destroy
          render json: { message: "Product deleted" }, status: :ok
        end

        private

        def require_shop
          @shop = current_user.shop
          return render json: { error: "You must create a shop first" }, status: :forbidden unless @shop
        end

        def set_product
          @product = @shop.products.find(params[:id])
        rescue ActiveRecord::RecordNotFound
          render json: { error: "Product not found" }, status: :not_found
        end

        def product_params
          params.require(:product).permit(
            :name, :description, :price, :stock, :category, :image_url,
            :availability_type, :preorder_lead_time_hours, :next_available_date,
            :max_orders_per_day, :status, :featured
          )
        end
      end
    end
  end
end
