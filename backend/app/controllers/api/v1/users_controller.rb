module Api
  module V1
    class UsersController < ApplicationController
      # POST /api/v1/signup
      def create
        user = User.new(user_params)
        user.verified = false

        if user.save
          render json: { status: 'success', user: user }, status: :created
        else
          render json: { status: 'error', errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/login
      def login
        user = User.find_by(contact_number: params[:contact_number])

        if user&.authenticate(params[:password])
          render json: { status: 'success', user: user }, status: :ok
        else
          render json: { status: 'error', message: 'Invalid contact number or password' }, status: :unauthorized
        end
      end

      private

      def user_params
        params.require(:user).permit(
          :name,
          :contact_number,
          :password,
          :password_confirmation,
          :role,
          :block,
          :lot,
          :street,
          :district,   # homes or west
          :subphase    # Phase 1, Phase 2, etc.
        )
      end
    end
  end
end
