module Api
  module V1
    class UsersController < ApplicationController
      skip_before_action :authenticate_user, only: [:create]

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

      private

      def user_params
        params.require(:user).permit(
          :name, :contact_number,
          :password, :password_confirmation,
          :role, :block, :lot, :street,
          :district, :subphase
        )
      end
    end
  end
end
