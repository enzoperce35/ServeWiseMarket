module Api
  module V1
    class ProductRatingsController < ApplicationController
      before_action :set_product
      before_action :authenticate_user, only: [:create]

      # GET /api/v1/products/:product_id/ratings
      def index
        render json: @product.product_ratings.order(created_at: :desc), status: :ok
      end

      # POST /api/v1/products/:product_id/ratings
      def create
        rating = @product.product_ratings.new(rating_params)
        rating.user = current_user

        if rating.save
          render json: rating, status: :created
        else
          render json: { errors: rating.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_product
        @product = Product.find(params[:product_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Product not found" }, status: :not_found
      end

      def rating_params
        params.require(:product_rating).permit(:score, :comment)
      end
    end
  end
end
