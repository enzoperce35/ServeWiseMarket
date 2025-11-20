class Product < ApplicationRecord
  belongs_to :shop
  has_many :product_ratings, dependent: :destroy

  # Only show active products from open shops
  scope :available, -> { joins(:shop).where(status: "active", shops: { open: true }) }

  # Optional filters
  scope :by_category, ->(category) { where(category: category) if category.present? }
  scope :search, ->(term) { where("name ILIKE ?", "%#{term}%") if term.present? }
  scope :price_range, ->(min, max) {
    where("price >= ?", min) if min.present?
  }
  scope :price_range, ->(min, max) {
    if min.present? && max.present?
      where(price: min..max)
    elsif min.present?
      where("price >= ?", min)
    elsif max.present?
      where("price <= ?", max)
    end
  }

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

  PLACEHOLDER_URL = "https://via.placeholder.com/300x200.png?text=Product+Image"

  before_validation :normalize_image_url

  private

  # Ensure placeholder images never get saved
  def normalize_image_url
    if image_url.blank? || image_url == PLACEHOLDER_URL
      self.image_url = nil
    end
  end
end
