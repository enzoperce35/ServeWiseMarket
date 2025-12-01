module Api
  module V1
    class ProductsController < ApplicationController
      # No authentication needed for buyers
      skip_before_action :authenticate_user, only: [:index, :show]

      # GET /api/v1/products
      def index
        products = Product.available
                          .by_category(params[:category])
                          .search(params[:search])
                          .price_range(params[:min_price], params[:max_price])
                          .order(created_at: :desc)
                          .includes(shop: :user) # eager load shop and user

        render json: products.as_json(
          only: [:id, :name, :description, :price, :stock, :category, :image_url,
                 :delivery_date, :delivery_time, :delivery_date_gap,
                 :preorder_delivery, # newly added
                 :cross_comm_delivery, :cross_comm_charge, :status],
          include: {
            shop: {
              only: [:id, :name, :status],
              include: {
                user: {
                  only: [:id, :name, :community, :phase, :contact_number]
                }
              }
            }
          }
        ), status: :ok
      end

      # GET /api/v1/products/:id
      def show
        product = Product.available.includes(shop: :user).find(params[:id])

        render json: product.as_json(
          only: [:id, :name, :description, :price, :stock, :category, :image_url,
                 :delivery_date, :delivery_time, :delivery_date_gap,
                 :preorder_delivery, # newly added
                 :cross_comm_delivery, :cross_comm_charge, :status],
          include: {
            shop: {
              only: [:id, :name, :status],
              include: {
                user: {
                  only: [:id, :name, :community, :phase, :contact_number]
                }
              }
            }
          }
        ), status: :ok
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Product not found" }, status: :not_found
      end
    end
  end
end
