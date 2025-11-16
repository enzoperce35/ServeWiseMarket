class ApplicationController < ActionController::API
  before_action :authenticate_user

  # Encode payload into JWT
  def encode_token(payload)
    JWT.encode(payload, Rails.application.secrets.secret_key_base)
  end

  # Read Authorization header
  def auth_header
    request.headers['Authorization']
  end

  # Decode JWT
  def decoded_token
    if auth_header
      token = auth_header.split(' ')[1]
      begin
        JWT.decode(token, Rails.application.secrets.secret_key_base, true, algorithm: 'HS256')
      rescue JWT::DecodeError
        nil
      end
    end
  end

  # Find current user from decoded token
  def current_user
    @current_user ||= User.find_by(id: decoded_token[0]['user_id']) if decoded_token
  end

  # Protect routes
  def authenticate_user
    render json: { error: 'Not Authorized' }, status: :unauthorized unless current_user
  end
end

