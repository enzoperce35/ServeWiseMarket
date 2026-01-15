class Cart < ApplicationRecord
  belongs_to :user, optional: true  # ✅ allow guest carts
  has_many :cart_items, dependent: :destroy

  validates :status, presence: true
end
