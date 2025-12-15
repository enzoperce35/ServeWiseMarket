class User < ApplicationRecord
  has_secure_password

  # Associations
  has_one :shop, dependent: :destroy

  has_one :cart, dependent: :destroy

  has_many :orders

  # Name: required
  validates :name, presence: true

  # Contact number: required, PH format
  validates :contact_number, presence: true, uniqueness: true,
    format: { with: /\A09\d{9}\z/, message: "must be a valid PH number (e.g., 09123456789)" }

  # Password: minimum 6 chars
  validates :password, length: { minimum: 6 }, if: -> { new_record? || !password.nil? }

  # Block: required, numbers only, max 2 chars
  validates :block, presence: true,
            numericality: { only_integer: true },
            length: { maximum: 2 }

  # Lot: required, numbers only, max 2 chars
  validates :lot, presence: true,
            numericality: { only_integer: true },
            length: { maximum: 2 }

  # Street: required, letters/numbers/symbols, max 30 chars
  validates :street, presence: true,
            length: { maximum: 30 },
            format: { with: /\A[\w\s\-.]+\z/, message: "only allows letters, numbers, and symbols like '-', '.', 'Ave'" }

  # Community & Phase: required (strings, not integers)
  validates :community, presence: true, length: { maximum: 50 }
  validates :phase, presence: true, length: { maximum: 50 }

  # Role: must be buyer or seller
  validates :role, inclusion: { in: %w[buyer seller] }
end
