class CartItem < ApplicationRecord
  belongs_to :cart
  belongs_to :product
  belongs_to :variant, class_name: "ProductVariant", optional: true

  validates :quantity, numericality: { greater_than: 0 }
end
