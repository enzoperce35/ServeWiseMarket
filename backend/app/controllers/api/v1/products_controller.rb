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

        ordered_labels = [
          "Now", "6am", "7am", "8am", "9am", "10am", "11am", "12pm",
          "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm"
        ]

        result = groups.map do |group|
          {
            id: group.id,
            name: group.name,
            ph_timestamp: group.ph_timestamp,
            products: group.product_delivery_groups
                           .select(&:active)
                           .map(&:product)
                           .map do |p|
                             next unless p

                             {
                               id: p.id,
                               name: p.name,
                               price: p.price,
                               stock: p.stock,
                               image_url: p.image_url,
                               category: p.category,
                               status: p.status,
                               preorder_delivery: p.preorder_delivery,
                               # ✅ include active variants
                               variants: p.variants.select(&:active).map do |v|
                                 {
                                   id: v.id,
                                   name: v.name,
                                   price: v.price,
                                   active: v.active
                                 }
                               end
                             }
                           end.compact
          }
        end

        # ⭐ safe ordering — cannot crash, cannot hide anything
        result = result.sort_by do |g|
          name = g[:name].to_s
          label_index = ordered_labels.index(name)

          if label_index
            [0, label_index]
          else
            [1, g[:ph_timestamp] || Time.zone.now]
          end
        end

        render json: result, status: :ok
      end

      # GET /api/v1/products/:id
      def show
        product = Product.available.includes(:product_delivery_groups, shop: :user).find(params[:id])

        render json: product.as_json(
          methods: [:cross_comm_charge],
          only: [
            :id, :name, :description, :price, :stock, :category, :image_url,
            :delivery_date, :delivery_time, :delivery_date_gap,
            :preorder_delivery, :cross_comm_delivery, :status
          ],
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
            },
            variants: {
              only: [:id, :name, :price, :active]
            }
          }
        ), status: :ok
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Product not found" }, status: :not_found
      end

      def deduct_stock
        product = Product.find(params[:id])
        qty = params[:quantity].to_i
        variant_id = params[:variant_id]
      
        return render json: { error: "Invalid quantity" }, status: :unprocessable_entity if qty <= 0
      
        if variant_id.present?
          variant = product.variants.find(variant_id)
          return render json: { error: "Insufficient variant stock" }, status: :unprocessable_entity if variant.stock < qty
      
          variant.with_lock do
            variant.stock -= qty
            variant.save!
          end
      
          # Optional: also decrement mother product stock if you track total stock
          product.with_lock do
            product.stock -= qty
            product.save!
          end
        else
          return render json: { error: "Insufficient stock" }, status: :unprocessable_entity if product.stock < qty
      
          product.with_lock do
            product.stock -= qty
            product.save!
          end
        end
      
        render json: { message: "Stock deducted", product_stock: product.stock, variant_stock: variant&.stock }
      end
          
    end
  end
end
