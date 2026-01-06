module Api
  module V1
    module Seller
      class ShopsController < ApplicationController
        include ShopStatusUpdater

        before_action :authenticate_user
        before_action :set_shop, only: [:show, :update]

        # GET /api/v1/seller/shop
        # Returns the current user's shop, or null if none exists
        def show
          if @shop
            @shop.auto_close_if_needed

            render json: {
              shop: {
                id: @shop.id,
                name: @shop.name,
                image_url: @shop.image_url,
                cross_comm_charge: @shop.cross_comm_charge,
                cross_comm_minimum: @shop.cross_comm_minimum,
                open: @shop.open_now?,
                community: @shop.community,
                shop_payment_accounts: @shop.shop_payment_accounts.map do |acc|
                  {
                    id: acc.id,
                    provider: acc.provider,
                    account_name: acc.account_name,
                    account_number: acc.account_number,
                    active: acc.active
                  }
                end
              }
            }, status: :ok
          else
            # No shop yet → return null
            render json: { shop: nil }, status: :ok
          end
        rescue => e
          render json: { errors: e.message }, status: :internal_server_error
        end

        # PUT /api/v1/seller/shop
        def update
          return render json: { error: "Shop not found" }, status: :not_found unless @shop

          # Handle manual open/close toggle first
          handle_open_toggle(@shop, shop_params[:open]) if shop_params.key?(:open)

          Shop.transaction do
            @shop.update!(shop_params.except(:open))

            # Update existing accounts
            if params[:existing_accounts].present?
              params[:existing_accounts].each do |acc|
                record = @shop.shop_payment_accounts.find(acc[:id])
                record.update!(active: acc[:active])
              end
            end

            # Create new accounts
            if params[:shop_payment_accounts].present?
              params[:shop_payment_accounts].each do |acc|
                @shop.shop_payment_accounts.create!(
                  provider: acc[:provider],
                  account_name: acc[:account_name],
                  account_number: acc[:account_number],
                  active: true
                )
              end
            end
          end

          render json: {
            shop: @shop.reload,
            shop_payment_accounts: @shop.shop_payment_accounts
          }, status: :ok
        rescue => e
          render json: { errors: e.message }, status: :unprocessable_entity
        end

        # POST /api/v1/seller/shop
        def create
          if current_user.shop
            return render json: { error: "Shop already exists" }, status: :unprocessable_entity
          end

          shop = current_user.build_shop(shop_params)
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
          params.require(:shop).permit(
            :name,
            :image_url,
            :open,
            :cross_comm_charge,
            :cross_comm_minimum
          )
        end
      end
    end
  end
end
