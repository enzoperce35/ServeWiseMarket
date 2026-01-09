class ProductVariant < ApplicationRecord
  belongs_to :product

  scope :active, -> { where(active: true) }

  def effective_price
    price || product.price
  end
end
