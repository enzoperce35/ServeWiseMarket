class ApplicationController < ActionController::API
  before_action :authenticate_user
  before_action :set_current_cart

  # Generate JWT token
  def encode_token(payload)
    JWT.encode(payload, Rails.application.credentials.secret_key_base, 'HS256')
  end

  # Read Authorization header
  def auth_header
    request.headers['Authorization']
  end

  # Decode JWT
  def decoded_token
    token = auth_header&.split(' ')&.last
    return nil unless token

    begin
      JWT.decode(token, Rails.application.credentials.secret_key_base, true, algorithm: 'HS256')
    rescue JWT::DecodeError
      nil
    end
  end

  # Identify current user
  def current_user
    return @current_user if defined?(@current_user)

    decoded = decoded_token
    return nil unless decoded

    user_id = decoded[0]['user_id']
    @current_user ||= User.find_by(id: user_id)
  end

  # Protect routes
  def authenticate_user
    render json: { error: 'Not Authorized' }, status: :unauthorized unless current_user
  end

  private

  def set_current_cart
    return unless current_user
    @current_cart ||= current_user.cart || current_user.create_cart
  end

  def current_cart
    @current_cart
  end
end
