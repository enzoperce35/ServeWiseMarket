# app/controllers/api/v1/seller/shop_payment_accounts_controller.rb
module Api
  module V1
    module Seller
      class ShopPaymentAccountsController < ApplicationController
        before_action :authenticate_user

        def destroy
          account = current_user.shop.shop_payment_accounts.find(params[:id])
          account.destroy!
          render json: { success: true }
        end
      end
    end
  end
end
