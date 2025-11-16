class User < ApplicationRecord
  has_secure_password

  validates :name, presence: true

  validates :contact_number,
            presence: true,
            uniqueness: true,
            format: { with: /\A09\d{9}\z/, message: "must be a valid PH number (e.g., 09123456789)" }

  validates :role, inclusion: { in: %w[buyer seller] }

  validates :block, :lot, :street, presence: true

  # No validation for district or subphase
  # No before_validation callback
end
