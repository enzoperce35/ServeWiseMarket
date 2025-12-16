class Order < ApplicationRecord
  belongs_to :user
  belongs_to :shop
  has_many :order_items, dependent: :destroy

  ONGOING_STATUSES = %w[pending preparing accepted].freeze

  scope :ongoing, -> { where(status: ONGOING_STATUSES) }

  validates :status, presence: true
end
