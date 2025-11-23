# app/controllers/api/v1/products_controller.rb
module Api
  module V1
    class ProductsController < ApplicationController
      skip_before_action :authenticate_user, only: [:index, :show]

      def index
        products = Product.available
                          .by_category(params[:category])
                          .search(params[:search])
                          .price_range(params[:min_price], params[:max_price])
                          .order(created_at: :desc)

        render json: products, status: :ok
      end

      def show
        product = Product.available.find(params[:id])
        render json: product, status: :ok
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Product not found" }, status: :not_found
      end
    end
  end
end
