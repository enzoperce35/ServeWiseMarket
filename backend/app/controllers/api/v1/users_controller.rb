module Api
  module V1
    class UsersController < ApplicationController
      # POST /api/v1/signup
      def create
        user = User.new(user_params)
        user.verified = false

        if user.save
          render json: { status: 'success', user: user_response(user) }, status: :created
        else
          render json: { status: 'error', errors: user.errors.full_messages }, status: :unprocessable_entity
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
          :district,
          :subphase
        )
      end

      def user_response(user)
        {
          id: user.id,
          name: user.name,
          contact_number: user.contact_number,
          role: user.role,
          district: user.district,
          subphase: user.subphase,
          block: user.block,
          lot: user.lot,
          street: user.street,
          verified: user.verified
        }
      end
    end
  end
end
