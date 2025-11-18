class Product < ApplicationRecord
  belongs_to :seller, class_name: "User"

  # ----------------------------
  # VALIDATIONS
  # ----------------------------
  validates :name, presence: true
  validates :price, numericality: { greater_than_or_equal_to: 0 }
  validates :stock, numericality: { greater_than_or_equal_to: 0, only_integer: true }
  validates :category, presence: true

  # Optional: Scope for filtering
  scope :by_category, ->(category) { where(category: category) if category.present? }
  scope :search, ->(text) { where("name ILIKE ? OR description ILIKE ?", "%#{text}%", "%#{text}%") if text.present? }
  scope :price_range, ->(min, max) { where(price: min..max) if min && max }
end
