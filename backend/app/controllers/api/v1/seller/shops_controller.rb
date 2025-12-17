module Api
  module V1
    module Seller
      class ShopsController < ApplicationController
        include ShopStatusUpdater

        before_action :authenticate_user
        before_action :set_shop, only: [:show, :update]

        # GET /api/v1/seller/shop
        def show
          if @shop
            update_shop_status(@shop)
            render json: { shop: @shop }, status: :ok
          else
            render json: { shop: nil }, status: :ok
          end
        end

        # PUT /api/v1/seller/shop
        def update
          return render json: { error: "Shop not found" }, status: :not_found unless @shop

          handle_open_toggle(@shop, shop_params[:open]) if shop_params[:open].present?

          if @shop.update(shop_params)
            update_shop_status(@shop, manual_toggle: true)
            render json: { shop: @shop }, status: :ok
          else
            render json: { errors: @shop.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # POST /api/v1/seller/shop
       
        def create
          if current_user.shop
            return render json: { error: "Shop already exists" }, status: :unprocessable_entity
          end

          shop = current_user.build_shop(
            shop_params.merge(
            community: current_user.community
            )
          )

          if shop.save
            render json: { shop: shop }, status: :created
          else
            render json: { errors: shop.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def set_shop
          @shop = current_user.shop
          # DO NOT render 404 here
        end

        def shop_params
          params.require(:shop).permit(
            :name,
            :description,
            :image_url,
            :open
          )
        end        
      end
    end
  end
end
