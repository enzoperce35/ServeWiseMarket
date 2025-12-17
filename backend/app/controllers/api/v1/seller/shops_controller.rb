module Api
  module V1
    module Seller
      class ShopsController < ApplicationController
        include ShopStatusUpdater

        before_action :authenticate_user
        before_action :set_shop, only: [:show, :update]

        # GET /api/v1/seller/shop
        def show
          # Auto-close shop if needed (no manual toggle)
          @shop.auto_close_if_needed if @shop

          render json: { shop: @shop }, status: :ok
        end

        # PUT /api/v1/seller/shop
        def update
          return render json: { error: "Shop not found" }, status: :not_found unless @shop
        
          # Handle manual toggle
          if shop_params.key?(:open)
            handle_open_toggle(@shop, shop_params[:open])
          end
        
          if @shop.update(shop_params.except(:open))
            render json: { shop: @shop }, status: :ok
          else
            render json: { errors: @shop.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # POST /api/v1/seller/shop
        def create
          return render json: { error: "Shop already exists" }, status: :unprocessable_entity if current_user.shop
        
          shop = current_user.build_shop(shop_params)
          # Set community automatically from user
          shop.community ||= current_user.community
          if shop.save
            render json: { shop: shop }, status: :created
          else
            render json: { errors: shop.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def set_shop
          @shop = current_user.shop
        end

        def shop_params
          params.require(:shop).permit(:name, :description, :image_url, :open)
        end        
      end
    end
  end
end
