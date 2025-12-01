class Product < ApplicationRecord
  belongs_to :shop
  has_many :product_ratings, dependent: :destroy

  PLACEHOLDER_URL = "https://via.placeholder.com/300x200.png?text=Product+Image"

  # ----------------------
  # Scopes
  # ----------------------
  # Only show active products from open shops
  scope :available, -> { where(status: true) }

  # Optional filters
  scope :by_category, ->(category) { where(category: category) if category.present? }

  scope :search, ->(term) {
    where("name ILIKE ?", "%#{term}%") if term.present?
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

  # ----------------------
  # Validations
  # ----------------------
  validates :status, inclusion: { in: [true, false] }
  validates :cross_comm_charge,
            numericality: { greater_than_or_equal_to: 0 },
            allow_nil: true
  validates :delivery_date_gap,
            numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :preorder_delivery, inclusion: { in: [true, false] } # new validation

  # ----------------------
  # Ratings helpers
  # ----------------------
  def average_rating
    product_ratings.average(:score)&.round(2) || 0
  end

  def ratings_count
    product_ratings.count
  end

  # ----------------------
  # Callbacks
  # ----------------------
  before_validation :normalize_image_url

  private

  # Ensure placeholder images never get saved
  def normalize_image_url
    if image_url.blank? || image_url == PLACEHOLDER_URL
      self.image_url = nil
    end
  end
end
