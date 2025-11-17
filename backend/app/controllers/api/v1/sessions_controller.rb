module Api
  module V1
    class SessionsController < ApplicationController
      skip_before_action :authenticate_user, only: [:create]

      # POST /api/v1/login
      def create
        user = User.find_by(contact_number: params[:contact_number])

        if user&.authenticate(params[:password])
          token = encode_token({ user_id: user.id })

          render json: {
            status: 'success',
            user: {
              id: user.id,
              name: user.name,
              role: user.role
            },
            token: token
          }, status: :ok

        else
          render json: { error: 'Invalid contact number or password' }, status: :unauthorized
        end
      end
    end
  end
end
