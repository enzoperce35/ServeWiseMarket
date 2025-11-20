module Api
  module V1
    module Seller
      class ShopsController < ApplicationController
        before_action :authenticate_user
        before_action :set_shop, only: [:update, :show]

        # GET /api/v1/seller/shop
        def show
          render json: @shop, status: :ok
        end

        # POST /api/v1/seller/shop
        def create
          if current_user.shop
            return render json: { error: "Shop already exists" }, status: :unprocessable_entity
          end

          shop = current_user.build_shop(shop_params)
          if shop.save
            render json: shop, status: :created
          else
            render json: { errors: shop.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # PUT /api/v1/seller/shop
        def update
          if @shop.update(shop_params)
            render json: @shop, status: :ok
          else
            render json: { errors: @shop.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def set_shop
          @shop = current_user.shop
          render json: { error: "Shop not found" }, status: :not_found unless @shop
        end

        def shop_params
          params.require(:shop).permit(:name, :image_url, :open)
        end
      end
    end
  end
end
