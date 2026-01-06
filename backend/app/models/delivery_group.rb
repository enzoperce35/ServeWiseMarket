class DeliveryGroup < ApplicationRecord
  has_many :product_delivery_groups, dependent: :destroy
  has_many :products, through: :product_delivery_groups

  scope :active, -> { where(active: true) }

  # -1 = Now
  #  0..23 = PH hour
  scope :time_filtered, -> { where(ph_timestamp: [-1] + (6..20).to_a) }

  validates :name, presence: true
  validates :ph_timestamp, presence: true
end
