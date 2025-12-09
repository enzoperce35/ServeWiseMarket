module Api
  module V1
    class UsersController < ApplicationController
      include ShopStatusUpdater

      # Skip authenticate_user only for me & create
      skip_before_action :authenticate_user, if: -> { action_name.in?(%w[me create]) }

      before_action :authorize_user, only: [:me]

      def me
        shop = current_user.shop
        update_shop_status(shop) if shop

        render json: {
          status: 'success',
          user: current_user.as_json(
            include: { shop: { only: [:id, :name, :image_url, :open, :user_opened_at] } }
          )
        }
      end

      private

      def authorize_user
        unless current_user
          render json: { error: 'Unauthorized' }, status: :unauthorized
        else
          @current_user = current_user
        end
      end
    end
  end
end
