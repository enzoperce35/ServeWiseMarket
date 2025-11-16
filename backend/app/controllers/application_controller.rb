# app/controllers/application_controller.rb
require 'jwt'  # make sure the jwt gem is loaded

class ApplicationController < ActionController::API
  before_action :authenticate_user

  private

  # ----------------------------
  # JWT Encoding / Decoding
  # ----------------------------

  # Encode a payload into a JWT
  def encode_token(payload)
    JWT.encode(payload, Rails.application.secret_key_base)
  end

  # Read Authorization header
  def auth_header
    request.headers['Authorization']
  end

  # Decode JWT and return payload
  def decoded_token
    return nil unless auth_header

    token = auth_header.split(' ')[1]
    begin
      JWT.decode(token, Rails.application.secret_key_base, true, algorithm: 'HS256')
    rescue JWT::DecodeError
      nil
    end
  end

  # ----------------------------
  # Current User Helpers
  # ----------------------------

  # Get current user from JWT
  def current_user
    return nil unless decoded_token
    user_id = decoded_token[0]['user_id']
    @current_user ||= User.find_by(id: user_id)
  end

  # Protect routes
  def authenticate_user
    render json: { error: 'Not Authorized' }, status: :unauthorized unless current_user
  end
end
