# app/controllers/api/v1/delivery_groups_controller.rb
module Api
  module V1
    class DeliveryGroupsController < ActionController::API
      # GET /api/v1/delivery_groups
      def index
        groups = DeliveryGroup.active.order(:ph_timestamp)
        render json: groups.as_json(
          only: [:id, :name, :ph_timestamp, :active],
          include: { products: { only: [:id, :name, :price, :stock, :image_url] } }
        )
      end

      # POST /api/v1/delivery_groups/find_or_create
      def find_or_create
        name = params[:name]
        ph_timestamp = params[:ph_timestamp]

        unless ph_timestamp.present? && name.present?
          return render json: { error: "Missing ph_timestamp or name" }, status: :unprocessable_entity
        end

        # Find existing group or create new
        group = DeliveryGroup.find_or_create_by(ph_timestamp: ph_timestamp) do |dg|
          dg.name = name
          dg.active = true
        end

        render json: { delivery_group: group }, status: :ok
      end
    end
  end
end
