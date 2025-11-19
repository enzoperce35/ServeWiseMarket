class ProductRating < ApplicationRecord
  belongs_to :product
  belongs_to :user, optional: true

  validates :score, presence: true, inclusion: { in: 1..5 }
  validates :comment, length: { maximum: 500 }, allow_blank: true
end
