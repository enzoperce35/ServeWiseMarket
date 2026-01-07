module Api
  module V1
    class ProductDeliveryGroupsController < ApplicationController
      before_action :authenticate_user

      def create
        pdg = ProductDeliveryGroup.find_or_initialize_by(
          product_id: params[:product_id],
          delivery_group_id: params[:delivery_group_id]
        )
        pdg.active = true
        pdg.save!

        render json: { product_delivery_group: pdg.as_json(only: [:id, :product_id, :delivery_group_id, :active]) }, status: :ok
      end

      def activate
        pdg = ProductDeliveryGroup.find(params[:id])
        pdg.update!(active: true)

        render json: { product_delivery_group: pdg.as_json(only: [:id, :product_id, :delivery_group_id, :active]) }, status: :ok
      end

      def deactivate
        pdg = ProductDeliveryGroup.find(params[:id])
        pdg.update!(active: false)

        render json: { product_delivery_group: pdg.as_json(only: [:id, :product_id, :delivery_group_id, :active]) }, status: :ok
      end
    end
  end
end
