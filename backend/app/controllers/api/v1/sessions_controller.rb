class Api::V1::SessionsController < ApplicationController
  # Do NOT require authentication for login
  skip_before_action :authenticate_user, only: [:create]

  def create
    user = User.find_by(contact_number: params[:contact_number])

    if user&.authenticate(params[:password])
      token = encode_token({ user_id: user.id })

      render json: {
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          contact_number: user.contact_number,
          role: user.role,
          district: user.district,
          subphase: user.subphase
        },
        token: token
      }, status: :ok
    else
      render json: { error: "Invalid contact number or password" }, status: :unauthorized
    end
  end
end
