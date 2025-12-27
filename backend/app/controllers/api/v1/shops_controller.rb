# app/controllers/api/v1/shops_controller.rb
module Api
  module V1
    class ShopsController < ApplicationController
      skip_before_action :authenticate_user, raise: false

      def show
        shop = Shop.includes(:user, :products, :shop_payment_accounts).find_by(id: params[:id])
        return render json: { shop: nil }, status: :not_found unless shop

        render json: {
          shop: {
            id: shop.id,
            name: shop.name,
            image_url: shop.image_url,
            community: shop.community,
            open: shop.open_now?, # NON-mutating

            cross_comm_charge: shop.cross_comm_charge,
            cross_comm_minimum: shop.cross_comm_minimum,

            user: shop.user && {
              id: shop.user.id,
              name: shop.user.name,
              contact_number: shop.user.contact_number,
              block: shop.user.block,
              lot: shop.user.lot,
              street: shop.user.street,
              phase: shop.user.phase,
              community: shop.user.community
            },

            products: shop.products.map do |p|
              {
                id: p.id,
                name: p.name,
                price: p.price,
                stock: p.stock,
                status: p.status,
                preorder_delivery: p.preorder_delivery,
                delivery_date: p.delivery_date,
                delivery_time: p.delivery_time
              }
            end,

            shop_payment_accounts: shop.shop_payment_accounts.map do |acc|
              {
                provider: acc.provider,
                account_name: acc.account_name,
                account_number: acc.account_number,
                active: acc.active
              }
            end
          }
        }, status: :ok
      end
    end
  end
end
