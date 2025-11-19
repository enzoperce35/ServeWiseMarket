class Product < ApplicationRecord
  # Associations
  belongs_to :shop

  has_many :product_ratings, dependent: :destroy
  
  # Availability validation
  validates :availability_type, inclusion: { in: %w[on_hand pre_order] }

  with_options if: :pre_order? do
    validates :preorder_lead_time_hours, presence: true, numericality: { greater_than: 0 }
    validates :next_available_date, presence: true
  end

  # Status validation
  validates :status, inclusion: { in: %w[active draft archived] }

  # Convenience flag
  def pre_order?
    availability_type == "pre_order"
  end

  # Ratings helpers
  def average_rating
    product_ratings.average(:score)&.round(2) || 0
  end

  def ratings_count
    product_ratings.count
  end
end
