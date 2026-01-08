# app/controllers/api/v1/delivery_groups_controller.rb
module Api
  module V1
    class DeliveryGroupsController < ActionController::API
      # GET /api/v1/delivery_groups
      def index
        groups = DeliveryGroup.order(:ph_timestamp) # include inactive groups too
      
        render json: groups.as_json(
          only: [:id, :name, :ph_timestamp, :active],
          include: {
            products: {
              only: [:id, :name, :price, :stock, :status, :image_url],
              methods: [:cross_comm_charge],
              include: :shop
            }
          }
        ).map do |group|
          group["products"] = group["products"].select { |p| p["status"] && p["stock"].to_i > 0 }
          group
        end
      end      

      def update
        dg = DeliveryGroup.find(params[:id])
        dg.update!(active: params[:active])
        render json: { delivery_group: dg }, status: :ok
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

      def activate
        dg = DeliveryGroup.find(params[:id])
        dg.update!(active: true)
        render json: { delivery_group: dg }, status: :ok
      end
      
      def deactivate
        dg = DeliveryGroup.find(params[:id])
        dg.update!(active: false)
        render json: { delivery_group: dg }, status: :ok
      end
    end
  end
end
