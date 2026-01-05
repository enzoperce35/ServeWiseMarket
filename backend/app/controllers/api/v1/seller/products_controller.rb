# app/controllers/api/v1/seller/products_controller.rb
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

          if product.save
            render json: product, status: :created
          else
            render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # PUT/PATCH /api/v1/seller/products/:id
        def update
          if @product.update(product_params)
            render json: @product
          else
            render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
          end
        end          

        # DELETE /api/v1/seller/products/:id
        def destroy
          @product.soft_delete!
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
            :name,
            :description,
            :price,
            :stock,
            :category,
            :image_url,
            :status,
            :featured,
            :delivery_date_gap,
            :delivery_date,
            :delivery_time,
            :cross_comm_delivery,
            :cross_comm_charge,
            :preorder_delivery,
            delivery_times: [:hour]
          )
        end
      end
    end
  end
end
