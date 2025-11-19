module Api
  module V1
    class UsersController < ApplicationController
      skip_before_action :authenticate_user, only: [:create]

      before_action :authorize_user, only: [:me]

      # POST /api/v1/signup
      def create
        user = User.new(user_params)

        if user.save
          token = encode_token({ user_id: user.id })
          render json: { status: 'success', user: user, token: token }, status: :created
        else
          render json: { status: 'error', errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/me
      def me
        render json: { user: @current_user }
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

        begin
          decoded = JWT.decode(token, Rails.application.secret_key_base)[0]
          @current_user = User.find(decoded['user_id'])
        rescue
          render json: { error: 'Unauthorized' }, status: :unauthorized
        end
      end
    end
  end
end
