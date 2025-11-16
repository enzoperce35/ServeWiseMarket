class Api::V1::SessionsController < ApplicationController
  skip_before_action :authenticate_user, only: [:create]

  # POST /api/v1/login
  def create
    user = User.find_by(contact_number: params[:contact_number])

    if user&.authenticate(params[:password])
      token = encode_token({ user_id: user.id })
      render json: { user: user_response(user), token: token }, status: :ok
    else
      render json: { error: 'Invalid contact number or password' }, status: :unauthorized
    end
  end

  # DELETE /api/v1/logout
  def destroy
    render json: { message: 'Logged out successfully' }
  end

  private

  def user_response(user)
    {
      id: user.id,
      name: user.name,
      contact_number: user.contact_number,
      role: user.role
    }
  end
end
