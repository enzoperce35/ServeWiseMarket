module Api
  module V1
    class ProductsController < ApplicationController
      # No authentication needed for buyers
      skip_before_action :authenticate_user, only: [:index, :show]

      # GET /api/v1/products
      def index
        groups = DeliveryGroup
                  .where(active: true)
                  .includes(product_delivery_groups: { product: :variants })

        result = groups.map do |group|
          # include all products that exist via this delivery group
          products = group.product_delivery_groups.map(&:product).compact

          # skip group if it has no products
          next if products.empty?

          {
            id: group.id,
            name: group.name,
            ph_timestamp: group.ph_timestamp,
            products: products.map do |p|
              {
                id: p.id,
                name: p.name,
                price: p.price,
                stock: p.stock,
                image_url: p.image_url,
                category: p.category,
                status: p.status.nil? ? true : p.status,
                preorder_delivery: p.preorder_delivery,
                variants: p.variants.map do |v|
                  {
                    id: v.id,
                    name: v.name,
                    price: v.price,
                    active: v.active.nil? ? true : v.active
                  }
                end
              }
            end
          }
        end.compact

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
