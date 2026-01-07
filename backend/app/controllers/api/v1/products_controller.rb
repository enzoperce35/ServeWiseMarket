module Api
  module V1
    class ProductsController < ApplicationController
      # No authentication needed for buyers
      skip_before_action :authenticate_user, only: [:index, :show]

      # GET /api/v1/products
      def index
        # Load active delivery groups and eager load associations
        groups = DeliveryGroup
                  .where(active: true)
                  .includes(product_delivery_groups: :product)

        result = groups.map do |group|
          {
            id: group.id,
            name: group.name,
            ph_timestamp: group.ph_timestamp,
            # Include only products that have active ProductDeliveryGroup
            products: group.product_delivery_groups
                          .select(&:active)          # ✅ only active
                          .map(&:product)            # get the associated product
                          .map do |p|                # shape product JSON
                            {
                              id: p.id,
                              name: p.name,
                              price: p.price,
                              stock: p.stock,
                              image_url: p.image_url,
                              category: p.category,
                              status: p.status,
                              preorder_delivery: p.preorder_delivery
                            }
                          end
          }
        end

        render json: result, status: :ok
      end

      # GET /api/v1/products/:id
      def show
        product = Product.available.includes(:product_delivery_groups, shop: :user).find(params[:id])

        render json: product.as_json(
          methods: [:cross_comm_charge],
          only: [:id, :name, :description, :price, :stock, :category, :image_url,
                 :delivery_date, :delivery_time, :delivery_date_gap,
                 :preorder_delivery, :cross_comm_delivery, :status],
          include: {
            shop: {
              only: [:id, :name, :status, :cross_comm_charge, :cross_comm_minimum],
              include: {
                user: {
                  only: [:id, :name, :community, :phase, :contact_number]
                }
              }
            },
            product_delivery_groups: {
              only: [:id, :delivery_group_id, :active]
            },
            delivery_groups: {
              only: [:id, :name, :ph_timestamp]
            }
          }
        ), status: :ok
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Product not found" }, status: :not_found
      end
    end
  end
end
