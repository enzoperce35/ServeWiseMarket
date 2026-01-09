module Api
  module V1
    module Seller
      class ProductsController < ApplicationController
        before_action :authenticate_user
        before_action :require_shop
        before_action :set_product, only: [:update, :destroy]

        # GET /api/v1/seller/products
        def index
          products = current_user.shop.products.includes(:product_delivery_groups, :delivery_groups)

          render json: products.as_json(
            only: [:id, :name, :price, :stock, :image_url, :status],
            include: {
              variants: { only: [:id, :name, :stock, :price, :active] },
              product_delivery_groups: {
                only: [:id, :delivery_group_id, :active]
              },
              delivery_groups: {
                only: [:id, :name, :ph_timestamp]
              }
            }
          ), status: :ok
        end

        # POST /api/v1/seller/products
        def create
          product = @shop.products.build(product_params.except(:delivery_group_ids))

          if product.save
            # assign delivery groups
            update_delivery_groups(product)
            render json: product.as_json(include: :delivery_groups), status: :created
          else
            render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # PUT /api/v1/seller/products/:id
        def update
          if @product.update(product_params.except(:delivery_group_ids))
            update_delivery_groups(@product)
            render json: @product.as_json(include: :delivery_groups)
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

        # Strong params
        def product_params
          params.require(:product).permit(
            :name, :description, :price, :stock, :category,
            :image_url, :status, :featured, :delivery_date_gap,
            :delivery_date, :delivery_time, :cross_comm_delivery,
            :cross_comm_charge, :preorder_delivery,
            delivery_group_ids: [] # <-- this is important
          )
        end

        # Assigns delivery groups
        def update_delivery_groups(product)
          group_ids = product_params[:delivery_group_ids] || []
          product.delivery_groups = DeliveryGroup.where(id: group_ids)
        end
      end
    end
  end
end
