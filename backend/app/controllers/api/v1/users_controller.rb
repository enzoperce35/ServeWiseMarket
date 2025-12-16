module Api
  module V1
    class UsersController < ApplicationController
      include ShopStatusUpdater

      # Skip authentication for signup, login, and fetching current user
      skip_before_action :authenticate_user, only: [:create, :login, :me]

      # ------------------------
      # GET /api/v1/me
      # ------------------------
      def me
        unless current_user
          return render json: { status: "error", error: "Unauthorized" }, status: :unauthorized
        end

        shop = current_user.shop
        update_shop_status(shop) if shop  # restore old behavior

        render json: {
          status: "success",  # restore old 'success' keyword if desired
          user: current_user.as_json(
            include: { shop: { only: [:id, :name, :image_url, :open, :user_opened_at] } }
          )
        }
      end

      # ------------------------
      # POST /api/v1/signup
      # ------------------------
      def create
        user = User.new(user_params)

        if user.save
          token = encode_jwt(user.id)
          render json: { status: "ok", user: user, token: token }, status: :created
        else
          render json: { status: "error", errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # ------------------------
      # POST /api/v1/login
      # ------------------------
      def login
        user = User.find_by(contact_number: params[:contact_number])

        if user&.authenticate(params[:password])
          token = encode_jwt(user.id)
          render json: { status: "ok", user: user, token: token }, status: :ok
        else
          render json: { status: "error", errors: ["Invalid login credentials"] }, status: :unauthorized
        end
      end

      private

      def user_params
        params.require(:user).permit(
          :name, :contact_number, :password, :password_confirmation,
          :community, :phase, :street, :block, :lot, :role
        )
      end

      def encode_jwt(user_id)
        payload = { user_id: user_id, exp: 7.days.from_now.to_i }
        JWT.encode(payload, Rails.application.secret_key_base)
      end

      def decode_jwt(token)
        decoded = JWT.decode(token, Rails.application.secret_key_base).first
        HashWithIndifferentAccess.new(decoded)
      rescue
        nil
      end

      def current_user
        return @current_user if defined?(@current_user)

        header = request.headers["Authorization"]
        return nil unless header.present?

        token = header.split(" ").last
        decoded = decode_jwt(token)
        @current_user = decoded ? User.find_by(id: decoded[:user_id]) : nil
      end
    end
  end
end
