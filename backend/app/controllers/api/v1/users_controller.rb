module Api
  module V1
    class UsersController < ApplicationController
      skip_before_action :authenticate_user, only: [:create]
      before_action :authorize_user, only: [:me]

      # POST /api/v1/signup
      def create
        user = User.new(user_params)

        if user.save
          # Automatically create a shop if seller
          user.create_shop(name: "#{user.name}'s Shop", open: true) if user.role == "seller"

          token = encode_token({ user_id: user.id })
          render json: { status: 'success', user: user, token: token }, status: :created
        else
          render json: { status: 'error', errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/me
      def me
        if @current_user
          render json: {
            status: 'success',
            user: @current_user.as_json(
              include: { shop: { only: [:id, :name, :image_url, :open] } }
            )
          }, status: :ok
        else
          render json: { status: 'error', error: 'Unauthorized' }, status: :unauthorized
        end
      end

      private

      def user_params
        params.require(:user).permit(
          :name, :contact_number, :password, :password_confirmation,
          :role, :district, :subphase, :block, :lot, :street
        )
      end

      def authorize_user
        header = request.headers['Authorization']
        token = header.split(' ').last if header

        if token.present?
          begin
            decoded = JWT.decode(token, Rails.application.secret_key_base)[0]
            @current_user = User.find_by(id: decoded['user_id'])
          rescue JWT::DecodeError
            @current_user = nil
          end
        end

        render json: { error: 'Unauthorized' }, status: :unauthorized unless @current_user
      end

      # Helper method to encode token
      def encode_token(payload)
        JWT.encode(payload, Rails.application.secret_key_base)
      end
    end
  end
end
