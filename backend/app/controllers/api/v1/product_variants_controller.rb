class ProductVariantsController < ApplicationController
  def index
    product = Product.find(params[:product_id])
    render json: product.variants.active
  end

  def create
    variant = ProductVariant.create!(variant_params)
    render json: variant
  end

  private

  def variant_params
    params.require(:product_variant).permit(
      :product_id,
      :name,
      :price,
      :stock,
      :active,
      :image_url,
      options: {}
    )
  end
end
