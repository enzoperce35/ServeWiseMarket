module Api
  module V1
    module Seller
      class ShopsController < ApplicationController
        include ShopStatusUpdater

        before_action :authenticate_user
        before_action :set_shop, only: [:show, :update]

        # GET /api/v1/seller/shop
        def show
          update_shop_status(@shop) # auto-close if needed
          render json: @shop, status: :ok
        end

        # PUT /api/v1/seller/shop
        def update
          # Handle manual toggle first
          if shop_params[:open].present?
            handle_open_toggle(@shop, shop_params[:open])
          end

          if @shop.update(shop_params)
            # Skip auto-close because this is a manual toggle
            update_shop_status(@shop, manual_toggle: true)
            render json: @shop, status: :ok
          else
            render json: { errors: @shop.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # Optional: create shop for first time
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
