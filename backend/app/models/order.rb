class Order < ApplicationRecord
  belongs_to :user
  belongs_to :shop
  has_many :order_items, dependent: :destroy

  validates :status, presence: true
end
