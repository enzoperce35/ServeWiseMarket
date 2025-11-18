module Api
  module V1
    class ProductsController < ApplicationController
      skip_before_action :authenticate_user, only: [:index, :show]

      # GET /api/v1/products
      def index
        products = Product.all

        # Optional filters
        products = products.by_category(params[:category])
        products = products.search(params[:search])
        products = products.price_range(params[:min_price]&.to_f, params[:max_price]&.to_f)

        render json: products, status: :ok
      end

      # GET /api/v1/products/:id
      def show
        product = Product.find(params[:id])
        render json: product, status: :ok
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Product not found" }, status: :not_found
      end

      # POST /api/v1/products
      def create
        product = current_user.products.build(product_params)
        if product.save
          render json: product, status: :created
        else
          render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def product_params
        params.require(:product).permit(
          :name, :description, :price, :stock, :category, :image_url
        )
      end
    end
  end
end
