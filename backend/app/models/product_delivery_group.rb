class ProductDeliveryGroup < ApplicationRecord
  belongs_to :product
  belongs_to :delivery_group

  # Scope for only active products in a delivery group
  scope :active, -> { where(active: true) }
end
