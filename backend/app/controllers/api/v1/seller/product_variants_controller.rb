module Api
  module V1
    module Seller
      class ProductVariantsController < ApplicationController
        before_action :set_product, only: [:index, :create]
        before_action :set_variant, only: [:update, :destroy]

        def index
          render json: @product.variants
        end

        def create
          variant = @product.variants.new(variant_params)
          if variant.save
            render json: variant
          else
            render json: { errors: variant.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          if @variant.update(variant_params)
            render json: @variant
          else
            render json: { errors: @variant.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          @variant.destroy
          head :no_content
        end

        private

        def set_product
          @product = Product.find(params[:product_id])
        end

        def set_variant
          @variant = ProductVariant.find(params[:id])
        end

        def variant_params
          params.require(:product_variant).permit(:name, :price, :active)
        end
      end
    end
  end
end
