# app/controllers/api/v1/product_delivery_groups_controller.rb
module Api
  module V1
    class ProductDeliveryGroupsController < ActionController::API
      # POST /api/v1/product_delivery_groups
      def create
        product_id = params[:product_id]
        delivery_group_id = params[:delivery_group_id]

        unless product_id.present? && delivery_group_id.present?
          return render json: { error: "Missing product_id or delivery_group_id" }, status: :unprocessable_entity
        end

        # Avoid duplicates
        pdg = ProductDeliveryGroup.find_or_create_by(
          product_id: product_id,
          delivery_group_id: delivery_group_id
        )

        render json: { product_delivery_group: pdg }, status: :ok
      end
    end
  end
end
