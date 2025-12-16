# app/controllers/api/v1/sessions_controller.rb
class Api::V1::SessionsController < ApplicationController
  skip_before_action :authenticate_user, only: [:create]

  def create
    user = User.includes(:shop).find_by(contact_number: params[:contact_number])

    if user&.authenticate(params[:password])
      token = encode_token({ user_id: user.id })

      user_data = user.as_json(
        only: [:id, :name, :contact_number, :role, :community, :phase]
      )
      user_data[:shop] = user.shop

      render json: { user: user_data, token: token }, status: :ok
    else
      render json: { errors: ["Invalid contact number or password"] }, status: :unauthorized
    end
  end
end
