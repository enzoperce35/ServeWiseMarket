module Api
  module V1
    class ProductsController < ApplicationController
      skip_before_action :authenticate_user, only: [:index, :show]

      # GET /api/v1/products
      def index
        products = Product.available

        # Filters
        products = products.by_category(params[:category])
        products = products.search(params[:search])
        products = products.price_range(params[:min_price]&.to_f, params[:max_price]&.to_f)
        products = products.where(availability_type: params[:availability_type]) if params[:availability_type].present?
        products = products.where(featured: true) if params[:featured] == "true"

        render json: products.as_json(methods: [:average_rating, :ratings_count]), status: :ok
      end

      # GET /api/v1/products/:id
      def show
        product = Product.find(params[:id])
        render json: product.as_json(methods: [:average_rating, :ratings_count]), status: :ok
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

      # PATCH/PUT /api/v1/products/:id
      def update
        product = current_user.products.find(params[:id])
        if product.update(product_params)
          render json: product, status: :ok
        else
          render json: { errors: product.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/products/:id
      def destroy
        product = current_user.products.find(params[:id])
        product.destroy
        head :no_content
      end

      private

      def product_params
        params.require(:product).permit(
          :name, :description, :price, :stock, :category, :image_url,
          :availability_type, :preorder_lead_time_hours, :next_available_date, :max_orders_per_day,
          :status, :featured
        )
      end
    end
  end
end
