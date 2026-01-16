class User < ApplicationRecord
  include SoftDeletable
  
  has_secure_password

  # Associations
  has_one :shop, dependent: :destroy
  has_one :cart, dependent: :destroy
  has_many :orders

  # ------------------------
  # Validations
  # ------------------------

  # Name: required
  validates :name, presence: true

  # Contact number: required, PH format
  validates :contact_number, presence: true, uniqueness: true,
    format: { with: /\A09\d{9}\z/, message: "must be a valid PH number (e.g., 09123456789)" }

  # Password: minimum 6 chars
  validates :password, length: { minimum: 6 }, if: -> { new_record? || !password.nil? }

  # Address: required
  validates :address, presence: true, length: { maximum: 255 }

  # Community, role, messenger_url: optional, no validation
end
