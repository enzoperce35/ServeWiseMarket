class Shop < ApplicationRecord
  belongs_to :user
  has_many :products, dependent: :destroy

  has_many :orders

  validates :name, presence: true
end
